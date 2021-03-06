mainApp.directive('console',['$window','$timeout','$rootScope', '$http',function($window, $timeout, $rootScope, $http){
	return {
		restrict: 'EA',
		scope:{},
		templateUrl: 'partials/console.html',
		link:function(scope, element, attrs){
			scope.textarea= element.find('textarea')[0];
		},
		controller:function($scope){
			var MAX_LENGTH = 200;
			$scope.myTextarea='';
			visible = false;
			function scrollTop(){
				$timeout(function(){
					$scope.textarea.scrollTop = $scope.textarea.scrollHeight;
				},100);
			}
			function shorten(str){
				if (str && str.length > MAX_LENGTH) {
					str= str.substr(0, MAX_LENGTH/2 - 2) + ' ... ' + str.substr(str.length - MAX_LENGTH/2 - 3, str.length);
				}
				return str;
			}
			$scope.hide = function(){
				$rootScope.consoleShow = false;
			};
			$scope.$watch(function(){return $rootScope.consoleShow},function(newVal){
				if(newVal){
					scrollTop();
					$scope.checkSize();
				}
				visible = newVal;
			});
			$scope.checkSize = function(){
				var that = this;
				$http({method: 'GET', url: 'server/folder_size.php', cache: false}).
				then(function(response) {
					$scope.size = response.data.size;
				}, function(response) {
					console.log(response);
				});
			}
			function parseStack(stack,ctor){
				var err = stack.split(/\r?\n|\r/g);
				for(var i=0;i<err.length;i++){
					if(err[i].indexOf(ctor)<0 && err[i].indexOf('Error')<0){
						stack=err[i].trim();
						var arr =stack.split(' ');
						//remove 'at'
						arr.shift();
						var file = arr.pop();
						file.replace('(','');
						file.replace(')','');
						var obj={'file':file, 'fn':arr.join(' ')};
						var fileUrl= file.split('/');
						var url = fileUrl[fileUrl.length-1];
						var arrUrl = url.split(':');
						file=arrUrl[0];
						var num = arrUrl[1];
						obj.num=num;
						obj.short = file;
						return obj;
					}
				}
			}
			(function init(){
				if($window.console && console.log){
					var old = console.log;
					console.log = function(){
						var arg = arguments;
						var stack = parseStack(new Error().stack,this.constructor.name);
						$scope.$applyAsync(function(){
							var str='';
							for(var k in arg){
								str+=shorten(JSON.stringify(arg[k]))+' - ';
							}
							$scope.myTextarea += str+ ' @ '+stack.fn+' '+stack.short+':'+stack.num+'\r\n-------\r\n';
							scrollTop();
						});
						var mainArguments = Array.prototype.slice.call(arguments);
						mainArguments.push(stack.fn+' '+stack.file);
						old.apply(this, mainArguments);
					}
				}
			})();
		}
	}
}]);