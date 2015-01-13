/**
 * Created by john<bdu@tibco-support.com> on 12/13/14.
 *
 * Variable prefixes' meanings:
 * -------------------------------------------------------------------------
 * --- The prefix of a variable's name reveals the type of data it holds ---
 * -------------------------------------------------------------------------
 *
 * a: Array
 * a: Array
 * b: Boolean
 * d: DOM
 * f: Function
 * l: List(an array-like object)
 * n: Number
 * o: Object
 * r: Regular expression
 * s: String
 * x: More than one type
 *  : Special case or NOT my code
 *
 * *** These prefixes can be concatenated to indicate that the variable can
 *         hold the specified types of data ***
 */
/**
 * call demo:
 *
 *  <div style="overflow-x:hidden;overflow-y:scroll;width:800px;height:400px;background:pink;margin:0 auto;">
		 <cards-layout
			 num-of-column="4"
			 dialog-template-url= "./dialog.tpl.html"
			 card-template-url= "./cards.tpl.html"
			 apix-data="cardData"
			 dialog-scope="dialogScope"
		 >
		 </cards-layout>
 	</div>


	  @attr{num-of-column} Define how many column in a row of the card system.
	  @attr{dialog-template-url}Define the template url of the dialog in the popup layer.
	  @attr{card-template-url}It defines the template inner the card.
	  @attr{apix-data}It defines all the data of the card.
	  @attr{dialog-scope}Difines the scope of the dialog template


 Events:
	 * Usage:
	 $scope.$on(sEventName,fCallback);
		 Event lists:
		 {cardSystemInitialEnd}When the cards layout system is ready will invoke it.
			 @param{oEvent}Describe some attributes of current event.
			 @param{cardService}It is the service-{card}.you can invoke some apis of the sercice-{card} by this cardService.
		 {beforeCardDelete}When the delete icon in the toolbar of every card is deleted,this method will be invoked.
		 					You can use "cardService.confirmDeleteCurrentCard()" to really delete current card.
			 @param{oEvent}Describe some attributes of current event.
			 @param{aSelectedCardsIndex}Current selected card's index number.
		 {beforeSelectedCardsDelete}When you are try to deleting all the selected cards,
		 							this method will be invoked.
		 							You can use "cardService.confirmDeleteSelectedCards()" to really delete them.
			 @param{oEvent}Describe some attributes of current event.
			 @param{aSelectedCardsIndex}It is an array type,includes all the index of selected cards.
		 {selectedCardsDeleteSuccess}When all the selected cards are really deleted,this method will be invoked.
			 @param{oEvent}Describe some attributes of current event.
			 @param{aSelectedCardsIndex}It is an array type,includes all the indexes of selected cards.
		 {scrollBottom}When the scrollBar is scrolled to the bottom of the window,this method will be invoked.
		 			at this time,you can show your custom loading layer and fetch more data.
		 	@param{oEvent}Describe some attributes of current event.
		 {dialogOpen}When you clicked the icon to open the dialog,this method will be invoked.
			 @param{oEvent}Describe some attributes of current event.
			 @param{nIndex}Index of current operating card.
			 @param{oCurrentCardData}Include all the data of current operating card.
		 {cardDeleteSuccess}When one card is really deleted,this method will be invoked.
			 @param{oEvent}Describe some attributes of current event.
			 @param{nCurrentDeletingCardIndex}It is the index of current deleting card.
		 {cardMouseEnter}
		 {cardMouseMove}
		 {cardMouseLeave}
		 {cardClick}
		 			They are some dom operate for single card,maybe you will use them in some occasions.
			 @param{oEvent}Describe some attributes of current event.
			 @param{nIndex}Index of current operating card.
 */
(function() {
	'use strict';
	//Module definition.
	angular
		.module('apixCard', [
			'ui.bootstrap'
		])
		.controller('apixCardsController', apixCardsController)
		.directive('cardsLayout', cardsLayout)
		.directive('singleCard',singleCard)
		.directive('currentRepeatedCardDataRenderer',currentRepeatedCardDataRenderer)
		.factory('card', card)
		.factory('page', page);




	apixCardsController.$inject = ['$scope','$modal', '$q', 'card', 'page'];
	//The main controller of the card system.
	function apixCardsController(
		$scope,
		$modal,
		$q,
		card,
		page
	) {
		$scope.card = card($scope,$modal,$q);
		$scope.page = page($scope);
	}




	/**
	 *
	 * the directive:cards-layout
	 *
	 * @author John Du<bdu@tibco-support.com>
	 *
	 */
	function cardsLayout(){
		return {
			restrict:'EA',
			templateUrl:'./apixCards.tpl.html',
			transclude:true,


			controller:'apixCardsController',
			scope:{
				heightDivideWidth:'@',
				numOfColumn:'@',
				dialogTemplateUrl:'@',
				cardTemplateUrl:'@',
				apixData:'=',
				dialogScope:'='
			},
			link:function($scope,$element,$attr){
				$scope.card.jqCardsLayoutWrapper=$element.parent();
				$scope.page.init();
				$scope.card.init();
				if((!$attr.cardTemplateUrl)&&(!$attr.cardTemplate)){
					console.error('there is not temaplte to render a card');
					return false;
				}
				if(!$attr.dialogTemplateUrl){
					console.error('there is not a dialog template to render the dialog window');
					return false;
				}
			}

	};
}

	function singleCard(){
		return {
			restrict:'A',
			controller:function($scope){
				var data=$scope.$parent.apixData[$scope.currentIndex];
				angular.forEach(data,function(v,i){
					$scope[i]=data[i];
				});
			},
			scope:{
				currentIndex:'@'
			}

		};
	}
	function currentRepeatedCardDataRenderer(){
		return {
			restrict:'A',
			link:function($scope){
				var data=$scope.$parent.$parent.data;
				angular.forEach(data,function(v,i){
					$scope[i]=data[i];
				});

			}
		};
	}



	/**
	 * Here are some basic operate so that make sure the card system can be work normally.
	 *
	 * @author John Du<bdu@tibco-support.com>
	 *
	 */
	function card() {
		returnFun.$inject = ['$scope','$modal','$q'];

		function returnFun($scope,$modal,$q) {
			var o;
			var createSelectedCardsDeleteDeferred=function(){
				var def=$q.defer();
				def.promise.then(function(){
					var count = 0;
					angular.forEach(o.selectCardsIndex,function(v,i){
						var willDeleteIndex=o.selectCardsIndex[i]-count;
						$scope.apixData.splice(willDeleteIndex,1);
						count+=1;
					});
					o.selectCardsIndex=[];
					o.emit('selectedCardsDeleteSuccess',o.selectCardsIndex);
					o.selectedCardsDeleteDeferred=createSelectedCardsDeleteDeferred();
				},function(callback){
					callback();
					o.selectedCardsDeleteDeferred=createSelectedCardsDeleteDeferred();
				},function(callback){
					callback();
					o.selectedCardsDeleteDeferred=createSelectedCardsDeleteDeferred();
				});
				return def;
			};
			var createSingleCardDeleteDeferred=function(){
				var def=$q.defer();
				def.promise.then(function(){
					$scope.apixData.splice(o.currentDeletingCardIndex,1);
					o.emit('cardDeleteSuccess',o.currentDeletingCardIndex);
					o.singleCardDeleteDeferred=createSingleCardDeleteDeferred();
				},function(callback){
					callback();
					o.singleCardDeleteDeferred=createSingleCardDeleteDeferred();
				},function(callback){
					callback();
					o.singleCardDeleteDeferred=createSingleCardDeleteDeferred();
				});
				return def;
			};
			o = {
				jqCardsLayoutWrapper:null,
				ifMouseInApixCardsBigToolbarArea:false,
				apixCardsBigToolbarShow:false,
				$apixCardsSelectedAllIcon:$('.apix-cards-selected-all-icon'),
				selectCardsIndex:[],
				cardHeight:null,
				currentDeletingCardIndex:null,
				singleCardDeleteDeferred:createSingleCardDeleteDeferred(),
				selectedCardsDeleteDeferred:createSelectedCardsDeleteDeferred(),
				currentActivedCardIndex: null,
				emit:function(sEventName,p1, p2, p3, p4, p5,p6,p7,p8){
					$scope.$emit(sEventName,p1, p2, p3, p4, p5,p6,p7,p8);
				},
				toolbarMouseLeave:function(){
					if(o.selectCardsIndex.length===0){
						o.apixCardsBigToolbarShow=false;
					}
					o.ifMouseInApixCardsBigToolbarArea=false;
				},
				confirmDeleteSelectedCards:function(){
					o.selectedCardsDeleteDeferred.resolve();
				},
				cancelSelectedCards:function(){
					o.selectCardsIndex=[];
					$('.apix-card-toolbar')
						.hide()
						.find('.apix-card-selected-icon')
						.removeClass('apix-card-selected-icon-selected');
					o.setApixCardsBigToolbarShow();
					o.setApixCardsSelectedAllIconStatus();
				},
				setApixCardsSelectedAllIconStatus:function(){
					var dataLen=$scope.apixData.length;
					if(o.selectCardsIndex.length!==dataLen){
						o.$apixCardsSelectedAllIcon.removeClass('apix-cards-selected-all-icon-selected');
					}else{
						o.$apixCardsSelectedAllIcon.addClass('apix-cards-selected-all-icon-selected');
					}
				},
				toogleSelectedAllCards:function($event){
					var dataLen=$scope.apixData.length;
					var $toolbars=$('.apix-card-toolbar');
					if(o.selectCardsIndex.length!==dataLen){
						$($event.currentTarget).addClass('apix-cards-selected-all-icon-selected');
						o.selectCardsIndex=[];
						for(var i=0;i<dataLen;i+=1){
							o.selectCardsIndex.push(i);
							$toolbars
								.eq(i)
								.show()
								.find('.apix-card-selected-icon')
								.addClass('apix-card-selected-icon-selected');
						}
					}else{
						o.selectCardsIndex=[];
						$($event.currentTarget).removeClass('apix-cards-selected-all-icon-selected');
						$toolbars
							.hide()
							.find('.apix-card-selected-icon')
							.removeClass('apix-card-selected-icon-selected');
					}
					o.setApixCardsBigToolbarShow();
				},
				setApixCardsBigToolbarShow:function(){
					o.apixCardsBigToolbarShow=(o.selectCardsIndex.length!==0);
					if(o.ifMouseInApixCardsBigToolbarArea){
						o.apixCardsBigToolbarShow=true;
					}
				},
				toogleSelectCard:function($event,nIndex){
						if(o.selectCardsIndex.indexOf(nIndex)===-1){
							o.selectCardsIndex.push(nIndex);
							$($event.currentTarget).addClass('apix-card-selected-icon-selected');
						}else{
							var index=o.selectCardsIndex.indexOf(nIndex);
							o.selectCardsIndex.splice(index,1);
							$($event.currentTarget).removeClass('apix-card-selected-icon-selected');
						}
					o.setApixCardsBigToolbarShow();
					o.setApixCardsSelectedAllIconStatus();
				},
				confirmDeleteCurrentCard:function(){
					o.singleCardDeleteDeferred.resolve();
				},
				init: function() {
					o.resizeCardHeight();
					$scope.$emit('cardSystemInitialEnd',o);
				},
				deleteCard:function(nIndex){
					o.currentDeletingCardIndex=nIndex;
					$scope.$emit('beforeCardDelete',nIndex);
				},
				deleteSelectedCards:function(){
					$scope.$emit('beforeSelectedCardsDelete',o.selectCardsIndex);
				},
				resizeCardHeight:function(){
					var wrapperWidth=$scope.card.jqCardsLayoutWrapper.width();
					var hdw=$scope.heightDivideWidth;
					if(angular.isUndefined(hdw)||(isNaN(hdw))){
						return false;
					}
					o.cardHeight=(1/parseInt($scope.numOfColumn,10))*hdw*wrapperWidth+'px';
				},
				cardMouseEnter:function(oEvent,nIndex){
					$(oEvent.currentTarget).find('.apix-card-toolbar').show();
					$scope.card.emit('cardMouseEnter',nIndex);
				},
				cardMouseLeave:function(oEvent,nIndex){
					if(o.selectCardsIndex.indexOf(nIndex)!==-1){
						return false;
					}
					$(oEvent.currentTarget).find('.apix-card-toolbar').hide();
					$scope.card.emit('cardMouseLeave',nIndex);
				},
				cancelBubble:function(){
					event.preventDefault();
					event.cancelBubble=true;
					event.stopPropagation();
				},
				openDialog:function(nIndex){
					o.currentActivedCardIndex = nIndex;
					var currentCardData=$scope.card.currentCardData=$scope.currentCardData = $scope.apixData[nIndex];
					$modal.open({
						templateUrl:$scope.dialogTemplateUrl,
						scope: $scope.dialogScope,
						size: 'lg'
					});
					o.emit('dialogOpen',nIndex,currentCardData);
					o.cancelBubble();


				}
			};
			return o;
		}
		return returnFun;
	}


	/**
	 * Here are some basic operate so that make sure the pagination or drop-down-refresh can be work normally
	 *
	 * @author John Du<bdu@tibco-support.com>
	 */
	function page() {
		returnFun.$inject = ['$scope'];

		function returnFun($scope) {
			var o = {
				init: function() {
					var $p=$scope.card.jqCardsLayoutWrapper,
						nodeName=$p.get(0).nodeName.toLowerCase();
					if(nodeName==='body'){
						$(window).scroll(function() {
							var st = $(document).scrollTop();
							var wh = $(window).height();
							var docHeight = $(document).height();
							if (st + wh >= docHeight) {
								$scope.card.emit('scrollBottom');
							}
						});
					}
					else{
						var nScrollHight = 0,
							nScrollTop = 0,
							nDivHight = $p.height();
						$p.scroll(function(){
							nScrollHight = $(this)[0].scrollHeight;
							nScrollTop = $(this)[0].scrollTop;
							if(nScrollTop + nDivHight >= nScrollHight){
								$scope.card.emit('scrollBottom');
							}
						});
					}
				}
			};
			return o;
		}
		return returnFun;
	}
})();