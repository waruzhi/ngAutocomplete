/**
 * User: waruzhi(waruzhi@163.com)
 * Date: 2015.10.13
 */
angular.module('waruzhi.autocomplete', [])
	.directive('ngAutocomplete',['$timeout', '$filter', function($timeout,$filter){
		function initScope(scope) {
			scope.autocomplete = {};

			scope.autocomplete.data = {};
			scope.autocomplete.action = {};
			scope.autocomplete.data.results = [];
			scope.autocomplete.data.showResult = false;
			scope.autocomplete.data.resIndex = -1;
		}

		function setAttrs(scope, attr) {
			scope.autocomplete.data.placeholder = attr.placeholder || 'searching...';
			scope.autocomplete.data.maxResult = attr.maxResult || 5;
			scope.autocomplete.data.dataSource = (attr.datasource != undefined) ? scope[attr.datasource] : null;
		}

		return {
			restrict: 'E',
			scope: true,
			require: '?ngModel',
			link: function(scope, elem, attr, ngModel){
				initScope(scope);
				setAttrs(scope, attr);

				var Data = scope.autocomplete.data,
					Action = scope.autocomplete.action;

				Action.getLastWord = function(query) {
					var index = Math.max(query.lastIndexOf(' '), query.lastIndexOf(','), query.lastIndexOf('('));
					var realKeyword = '';
					if(index == -1) {
						realKeyword = query;
					} else {
						realKeyword = query.substr(index+1);
					}				
					if(realKeyword.indexOf(')') != -1) {
						realKeyword = '';
						index = -1;
					} 
					return {
						'index': index,
						'keyword': realKeyword
					};
				}
				Action.getResult = function() {
					if(Data.dataSource != null) {
						var realKeyword = Action.getLastWord(Data.keyword).keyword,
							searchproperty = Data.searchProperty;
						if(realKeyword.length < 1) {						
							Data.resIndex = -1;
							Data.showResult = false;
							return;
						}				
						Data.results = $filter('filter')(Data.dataSource, realKeyword);
						if(Data.results.length != 0) {
							Data.results = Data.results.splice(0, Data.maxResult);
							Data.resIndex = 0;
							Data.showResult = true;
						} else {
							Data.resIndex = -1;
							Data.showResult = false;
						}
					}
				}
				Action.handleKeyupAction = function(event) {
					var keyCode = event.which || event.keyCode;
					switch(keyCode) {
						// up
						case 38:
							if(Data.resIndex != -1) {
								Data.resIndex--;
							} else {
								Data.resIndex = Data.maxResult-1;
							}
							break;
						// down
						case 40:
							if(Data.resIndex == Data.maxResult - 1) {
								Data.resIndex = -1;
							} else {
								Data.resIndex++;
							}
							break;
						// enter
						case 13: 
							if(Data.resIndex != -1) {
								Action.setResult();		
								Data.resIndex = -1;
								event.stopPropagation();
							} 
						}
				}
				Action.handleMouseoverAction = function(index) {
					$timeout(function() {
						Data.resIndex = index;
					}, 5);
				}
				Action.setResult = function() {
					var index = Action.getLastWord(Data.keyword).index;
					Data.keyword = Data.keyword.substr(0, index) + Data.keyword.charAt(index) + Data.results[Data.resIndex];
					Data.showResult = false;
					ngModel.$setViewValue(Data.keyword);
				}
				Action.handleBlurAction = function() {
					Data.showResult = false;
				}
			},
			template:'<input class="ng-autocomplete-input" placeholder={{autocomplete.data.placeholder}} ng-model="autocomplete.data.keyword" ng-trim="false"'
					+	'ng-change="autocomplete.action.getResult()" '
					+	'ng-keyup="autocomplete.action.handleKeyupAction($event)" '
					// +	'ng-blur="autocomplete.action.handleBlurAction()" '
					+'></input>'
					+'<div class="ng-autocomplete-results " ng-show="autocomplete.data.showResult">'
					+	'<div class="ng-autocomplete-result" ng-repeat="result in autocomplete.data.results track by $index" ng-class="{\'selected\': $index == autocomplete.data.resIndex}"'
					+		'ng-mouseover="autocomplete.action.handleMouseoverAction($index)" '
					+		'ng-mousedown="autocomplete.action.setResult()"> '					
					+		'<span class="ng-autocomplete-item">{{result}}' 
					+		'</span>'
					+	'</div>'
					+'</div>'
		};
	}]);