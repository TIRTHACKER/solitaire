(function(global) {
	'use strict'
    var win = window,
        doc = document,
        body = doc.body;


    /**
     * Default configuration properties
     * @type {Object}
     */
    var defaultConfig = {

    };

    /**
     * Object.assign polyfill
     * @param  {Object} target
     * @param  {Object} args
     * @return {Object}
     */
    var extend = function(r, t) {
        for (var e = Object(r), n = 1; n < arguments.length; n++) {
            var a = arguments[n];
            if (null != a)
                for (var o in a) Object.prototype.hasOwnProperty.call(a, o) && (e[o] = a[o])
        }
        return e
    };

    /**
     * Add event listener to target
     * @param  {Object} el
     * @param  {String} e
     * @param  {Function} fn
     */
    var on = function(el, e, fn) {
        el.addEventListener(e, fn, false);
    };
	
    /**
     * Iterator helper
     * @param  {(Array|Object)}   arr Any object, array or array-like collection.
     * @param  {Function} f   The callback function
     * @param  {Object}   s      Change the value of this
     * @return {Void}
     */
    var each = function(arr, fn, s) {
        if ("[object Object]" === Object.prototype.toString.call(arr)) {
            for (var d in arr) {
                if (Object.prototype.hasOwnProperty.call(arr, d)) {
                    fn.call(s, d, arr[d]);
                }
            }
        } else {
            for (var e = 0, f = arr.length; e < f; e++) {
                fn.call(s, e, arr[e]);
            }
        }
    };

    /**
     * Mass assign style properties
     * @param  {Object} t
     * @param  {(String|Object)} e
     * @param  {String|Object}
     */
    var style = function(t, e) {
        var i = t && t.style,
            n = "[object Object]" === Object.prototype.toString.call(e);
        if (i) {
            if (!e) return win.getComputedStyle(t);
            n && each(e, function(t, e) {
                t in i || (t = "-webkit-" + t), i[t] = e + ("string" == typeof e ? "" : "opacity" === t ? "" : "px")
            })
        }
    };

    /**
     * Get an element's DOMRect relative to the document instead of the viewport.
     * @param  {Object} t   HTMLElement
     * @param  {Boolean} e  Include margins
     * @return {Object}     Formatted DOMRect copy
     */
    var rect = function(e) {
        var t = win,
            o = e.getBoundingClientRect(),
            b = doc.documentElement || body.parentNode || body,
            d = (void 0 !== t.pageXOffset) ? t.pageXOffset : b.scrollLeft,
            n = (void 0 !== t.pageYOffset) ? t.pageYOffset : b.scrollTop;
        return {
            left: o.left + d,
            top: o.top + n,
            height: Math.round(o.height),
            width: Math.round(o.width)
        }
	};
	
	var getRandomInt = function(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min)) + min;
	};	

	/* EMITTER */
	var Emitter = function() {};
	Emitter.prototype = {
		on: function(event, fct){
			this._events = this._events || {};
			this._events[event] = this._events[event]	|| [];
			this._events[event].push(fct);
		},
		off: function(event, fct){
			this._events = this._events || {};
			if( event in this._events === false  )	return;
			this._events[event].splice(this._events[event].indexOf(fct), 1);
		},
		emit: function(event /* , args... */){
			this._events = this._events || {};
			if( event in this._events === false  )	return;
			for(var i = 0; i < this._events[event].length; i++){
				this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};

	Emitter.mixin = function(obj) {
		var props	= ['on', 'off', 'emit'];
		for(var i = 0; i < props.length; i ++){
			if( typeof obj === 'function' ){
				obj.prototype[props[i]]	= Emitter.prototype[props[i]];
			}else{
				obj[props[i]] = Emitter.prototype[props[i]];
			}
		}
		return obj;
	};	
	
	// VECTOR
	function Vector(x, y) {
		this.x = x;
		this.y = y;
	}

	Vector.prototype = {
		add: function(v) {
			this.x += v.x, this.y += v.y;
		},	
	};	
	
	// CARD
	function Card(value, suit) {
		this.value = value;
		this.suit = suit;
		
		this.flipped = false;
		this.picture = this.value > 10;
		
		switch (this.suit) {
			case "hearts":
			case "diamonds":
				this.color = "red";
				break;
			case "clubs":
			case "spades":
				this.color = "black";
				break;				
		}
		
		var cards = ["A",2,3,4,5,6,7,8,9,10,"J","Q","K"];

		var template = [
			"<div class='front'><div class='value'>",cards[this.value-1],"</div><div class='value'>",cards[this.value-1],"</div><div class='middle'>"
		];

		if (!this.picture) {
			for (var i = 0; i <  this.value; i++) {
				template.push("<span></span>");
			}
		}

		template.push("</div></div><div class='rear'></div>");
		
		var card = doc.createElement("div");
		card.className = `card ${this.suit} card-${(this.picture ? cards[this.value-1] : this.value)}`;
		card.innerHTML = template.join("");
		
		if ( this.picture ) {
			card.classList.add("picture");
		}
		
		card.card = true;
		
		this.el = card;
	}
	
	Card.prototype.flip = function() {
		this.el.classList.toggle("flipped", !this.flipped);
		this.el.draggable = !this.flipped;
		this.flipped = !this.flipped;
		
		if ( !this.flipped ) {
			this.el.style.transform = "";
		}
	};
	
	// PACK
	function Pack() {
		this.cards = [];
		this.suits = ["hearts", "spades", "diamonds", "clubs"];
		
		var count = 0;
		each(this.suits, function(i, suit) {
			for ( var i = 1; i < 14; i++ ) {
				var card = new Card(i, suit);
				card.el.idx = count;
				this.cards.push(card);
				count++;
			}			
		}, this);
	}
	
	Pack.prototype.shuffle = function() {
		var m = this.cards.length,
			t, i;
		while (m) {
			i = Math.floor(Math.random() * m--);
			t = this.cards[m];
			this.cards[m] = this.cards[i];
			this.cards[i] = t;
			
			this.cards[i].el.idx = i;
			this.cards[m].el.idx = m;
		}
	};
	
	// GAME
	function Game(el, options) {
		
		if ( typeof el === "string" ) {
			el = document.querySelector(el);
		}
		
		this.el = el;
		
		this.options = extend(defaultConfig, options);
		
		this.score = 0;
		
		this.animationInterval = 250;
		
		this.stackToColumn = false;
		
		this.history = [];
		
		this.pack = new Pack();
		
		this.autoStacking = false;
		
		Emitter.mixin(this);
		
		this.render();
	}
	
	Game.prototype.render = function() {
		var frag = document.createDocumentFragment();

		this.columns = doc.createElement("div");
		this.columns.className = "columns";

		this.stacks = doc.createElement("div");
		this.stacks.className = "stacks";

		/* create stacks */
		for (var i = 0; i < 4; i++) {
			var stack = doc.createElement("div");
			stack.className = "stack";
			this.stacks.appendChild(stack);
		}

		/* Create columns */
		for (var i = 0; i < 7; i++) {
			var column = doc.createElement("div");
			column.className = "column";
			this.columns.appendChild(column);			
		}
		
		this.dealer = doc.createElement("div");
		this.dealer.className = "dealer";		

		this.packArea = doc.createElement("div");
		this.packArea.className = "pack";		

		this.dealArea = doc.createElement("div");
		this.dealArea.className = "dealt";		
		
		this.dealer.appendChild(this.packArea);
		this.dealer.appendChild(this.dealArea);
		
		frag.appendChild(this.dealer);
		frag.appendChild(this.stacks);
		frag.appendChild(this.columns);
		
		this.el.appendChild(frag);
		
		this.mouse = {
			x: 0, y: 0
		};
		
		var id = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/86186/cards-{t}.png";
		this.images = {
			clubs: id.replace("{t}", "clubs"),
			spades: id.replace("{t}", "spades"),
			diamonds: id.replace("{t}", "diamonds"),
			hearts: id.replace("{t}", "hearts")
		};
		
		each(this.images, function(i, src) {
			var image = new Image();
			
			image.crossOrigin = "anonymous";
			
			image.onload = function() {
				//
			};
			
			image.src = src;
			
			this.images[i] = image;
		}, this);
		
		this.events = {
			click: this.click.bind(this),
			mousedown: this.mousedown.bind(this),
			keydown: this.keydown.bind(this),
			mouseup: this.mouseup.bind(this),
			dragstart: this.dragstart.bind(this),
			dragenter: this.dragenter.bind(this),
			dragover: this.dragover.bind(this),
			dragend: this.dragend.bind(this)
		};
		
		on(this.dealer, "click", this.events.click);
		
		on(this.el, "mousedown", this.events.mousedown);
		on(doc, "keydown", this.events.keydown);
		on(doc, "mouseup", this.events.mouseup);
		
		on(doc, "dragstart", this.events.dragstart);		
		on(doc, "dragenter", this.events.dragenter);
		on(doc, "dragover", this.events.dragover);
		on(doc, "dragend", this.events.dragend);
	};
	
	Game.prototype.click = function(e) {
		var t = e.target;
		if ( t.classList.contains("pack") ) {
			e.stopImmediatePropagation();
			this.deal();
		}
	};
	
	Game.prototype.keydown = function(e) {
		var k = e.key;
		
		if ( e.ctrlKey ) {
			switch(k) {
				case "z":
					this.undo();
					break;
			}
		}
	};
	
	Game.prototype.mousedown = function(e) {
		
		if ( this.autoStacking ) {
			return false;
		}
		
		var t = e.target.closest(".card");
		
		if ( t && t.card ) {
			this.siblings = [];
			var card = this.pack.cards[t.idx];
			var next = card.el.nextElementSibling;
			
			card.checked = false;

			card.origin = {
				x: e.pageX,
				y: e.pageY,
			};

			card.el.classList.add("dragging");

			this.activeCard = card;

			this.startParent = card.el.parentNode;

			// grab the cards on top as well
			if ( next ) {
				var p = next.parentNode;
				var idx = Array.from(p.children).indexOf(next);
				for (var i = idx; i < p.childElementCount; i++) {
					var c = p.children[i];
					c.classList.add("dragging");
					this.siblings.push(c);
				}					
			}
		}			
	};

	Game.prototype.dragstart = function(e) {
		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setData('text/html', '');

		// Create blank image to hide the ghost
		var dragIcon = doc.createElement('img');
		e.dataTransfer.setDragImage(dragIcon, -10, -10);	

		this.dragging = true;
	};
	
	Game.prototype.dragenter = function(e) {
		var t = e.target;
		var column = t.classList.contains("column");
		var stack = t.classList.contains("stack");
		var canDrop = t.card || column || stack;

		if ( this.activeColumn ) {
			this.activeColumn.classList.remove("over");
		}

		if ( canDrop ) {
			if ( column || stack ) {
				this.activeColumn = t;
			} else {
				this.activeColumn = t.parentNode;
			}

			this.activeColumn.classList.add("over");
		}
	};

	Game.prototype.dragover = function(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'over';

		// Physically drag the card instead of using the D&D ghost
		if ( this.activeCard && this.dragging ) {
			var c = this.activeCard;
			var x = e.pageX - c.origin.x;
			var y = e.pageY - c.origin.y;
			var css = "pointer-events: none; transform: scale(1.05, 1.05) rotateX(0deg) translate3d("+x+"px, "+y+"px, 0px);";

			this.activeCard.el.style.cssText = css;

			if ( this.siblings.length ) {
				each(this.siblings, function(i, card) {
					card.style.cssText = css;
				}, this);
			}
		}			
	};

	Game.prototype.dragend = function(e) {

		if ( this.activeCard && this.dragging ) {

			var c = this.activeCard;
			c.el.classList.remove("dragging");

			var x = e.pageX - c.origin.x;
			var y = e.pageY - c.origin.y;

			c.el.style.cssText = "";

			if ( this.siblings.length ) {
				each(this.siblings, function(i, card) {
					card.classList.remove("dragging");
					card.style.cssText = "";
				}, this);
			}				

			if ( this.activeColumn ) {
				this.activeColumn.classList.remove("over");
			}			

			if ( this.isLegalMove() ) {
				var prev = c.el.previousElementSibling;

				// Flip the last card
				if ( prev ) {
					var card = this.pack.cards[prev.idx];

					if ( !card.flipped ) {
						card.prevState = card.flipped;
						card.flip();
						this.score += 5;
					}
				}

				this.stackToColumn = c.el.parentNode.classList.contains("stack");

				this.pickCount = c.el.parentNode.childElementCount;
				this.dropCount = this.activeColumn.childElementCount;

				this.activeColumn.appendChild(c.el);

				this.updateScore();

				if ( this.siblings.length ) {
					each(this.siblings, function(i, card) {
						if ( this.activeCard.value === 13 &&
							this.dropCount === 0 &&
							!this.startParent.classList.contains("dealt") &&
							c.el.parentNode.firstElementChild === c.el ) {

						} else {
							this.score += 5;
						}
						c.el.parentNode.appendChild(card);
						card.classList.remove("dragging");
					}, this);
				}
				
				this.updateHistory();
				
				this.startParent.classList.toggle("empty", !this.startParent.childElementCount);
				this.activeColumn.classList.toggle("empty", !this.activeColumn.childElementCount);

				this.emit("change");
			}
		}

		if ( !this.stackToColumn ) {
			this.check();
		}
	};

	Game.prototype.mouseup = function(e) {
		if ( this.activeCard ) {
			this.activeCard.el.classList.remove("dragging");
			this.activeCard = false;

			if ( this.siblings.length ) {
				each(this.siblings, function(i, card) {
					card.classList.remove("dragging");
				}, this);
			}
		}
		this.hinted = false;
		

		this.emit("change");
	};
	
	Game.prototype.updateHistory = function(card, start, end, siblings) {
		var obj = {};
		
		if ( Array.isArray(card) ) {
			obj.deal = true;
		} else {
			card = card || this.activeCard;
			start = start || this.startParent;
			end = end || this.activeColumn;
			siblings = siblings || this.siblings;

			// Max moves to store
			var max = 10;

			var cards = this.pack.cards;
			var prev = card.el.previousElementSibling;

			obj = {
				card: card, // the card that was moved
				start: start, // the original column
				end: end, // the column the card was dropped in
				siblings: siblings // any siblings
			};	

			if ( prev ) {
				obj.prevSibling = {
					card: cards[prev.idx],
					flipped: cards[prev.idx].flipped // was it hidden?
				};
			}
		}
		
		
		// Add the move to the history
		this.history.push(obj);
		
		// If the number of stored moves exceeds the max allowed
		// remove the oldest moves until we're at the max allowed
		if ( this.history.length > max ) {
			this.history.splice(0, this.history.length - max);
		}
	};
	
	Game.prototype.updateScore = function(start, stop) {
		start = start || this.startParent;
		stop = stop || this.activeColumn;
		
		// Moving Kings from empty column to empty column
		if ( this.dropCount === 0 && 
			this.activeCard.value === 13 &&
			!start.classList.contains("dealt") &&
			this.activeCard.el.parentNode.firstElementChild === this.activeCard.el ) {
			return false;
		}		
		
		// Moving from deck to column
		if ( start.classList.contains("dealt") ) {
			if ( stop.classList.contains("column") ) {
				this.score += 5;
			}
		// Moving from column to column
		} else if ( start.classList.contains("column") ) {
			if ( stop.classList.contains("column") ) {
				this.score += 3;
			}
		}
		
		// Moving to suit stack
		if ( stop.classList.contains("stack") ) {
			this.score += 10;
		}		
		
		// Moving from stacks to columns
		if ( start.classList.contains("stack") && stop.classList.contains("column") ) {
			this.score -= 10;
		}
	};
	
	Game.prototype.isLegalMove = function(active, column) {
		active = active || this.activeCard;
		column = column || this.activeColumn;
		
		var last = false;
		var legalMove = false;
		
		var lastEl = column.lastElementChild;
		var isColumn = column.classList.contains("column");
		var isPlaceholder = column.classList.contains("stack");
		
		if ( lastEl ) {
			last = this.pack.cards[lastEl.idx];
		}
		
		if ( isColumn ) {
			if ( !column.childElementCount ) {
				legalMove = active.value === 13;
			} else {
				legalMove = active.color !== last.color && active.value === last.value - 1;
			}
		} else if ( isPlaceholder ) {
			if ( !column.childElementCount ) {
				legalMove = active.value === 1;
			} else {
				legalMove = active.color === last.color && active.suit === last.suit && active.value === last.value + 1;
			}
		}
		
		return legalMove;
	};
	
	Game.prototype.undo = function() {
		var index = this.history.length - 1;
		
		if ( index > -1 ) {
		
			var obj = this.history[index];
			
			
			if ( obj.deal ) {
				// Last move was a deal
				var cards = [].slice.call(this.dealArea.children);
				var diff = this.dealArea.childElementCount - this.dealCount;

				var last = cards.splice(diff, this.dealCount);

				last.forEach(function(el) {
					var card = this.pack.cards[el.idx];
					if ( card.flipped ) {
						card.flip();
				this.startParent.classList.toggle("empty", !this.startParent.childElementCount);
					}

					this.packArea.appendChild(el);
				}, this);				
			} else {
				var card = obj.card;
				var last = obj.start.lastElementChild;

				// Hide the last card if it was flipped by moving the subsequent card
				if ( last ) {
					var lastCard = this.pack.cards[last.idx];

					if ( obj.prevSibling ) {
						if ( !obj.prevSibling.prevState && lastCard.flipped ) {
							lastCard.flip();
						} 
					}
				}

				// Move the card back to it's original column...
				obj.start.appendChild(card.el);

				// .. as well as it's siblings
				if ( obj.siblings.length ) {
					obj.siblings.forEach(function(el) {
						obj.start.appendChild(el);
					}, this);
				}

				card.checked = false;
				
				obj.start.classList.toggle("empty", !obj.start.childElementCount);
				obj.end.classList.toggle("empty", !obj.end.childElementCount);
			}

			// Remove the move from the history
			this.history.splice(index, 1);
		}
	};
	
	Game.prototype.deal = function() {
		var frag = document.createDocumentFragment();
		var pack = [].slice.call(this.packArea.children);
		var count = pack.length;
		
		if ( !count ) {
			while (this.dealArea.childElementCount) {
				var card = this.pack.cards[this.dealArea.lastElementChild.idx];
				card.flip();
				frag.appendChild(card.el);
			}

			this.packArea.appendChild(frag);
			
			return false;
		}
		
		
		this.dealer.classList.add("dealing");
		this.startParent = this.packArea;
		var items;
		if ( count > 3 ) {
			items = pack.slice(Math.max(count - 3, 1));
		} else {
			items = pack;
		}
		
		this.dealCount = items.length;
		
		items.forEach((card, i) => {
			if ( card ) {
				card = this.pack.cards[card.idx];
				
				const crect = rect(card.el);
				const prect = rect(this.dealArea);

				const x = crect.left - prect.left;
				const y = crect.top - prect.top;				
				
				this.dealArea.appendChild(card.el);
				
				card.el.style.cssText = `transform: translate3d(${x}px,${y}px,0px) rotateY(180deg);`;
				
				setTimeout(() => {
					card.el.style.cssText = `transform-origin: 50% 50%;transform: translate3d(0px,0px,0px) rotateY(0deg); transition: transform ${this.animationInterval}ms;`;
					
					card.flip();
					
					card.el.style.cssText = "";

					if ( i === items.length - 1 ) {
						setTimeout(() => {
							this.dealer.classList.remove("dealing");
						}, 250);
					}
				}, this.animationInterval * i);
			}
		}, this);
		
		this.updateHistory([]);
	};
	
	Game.prototype.check = function() {
		this.autoStacking = false;
		this.checked = false;
		var columns = [].slice.call(this.columns.children);
		var holders = this.stacks.children;
		
		columns.push(this.dealArea);
		
		columns.forEach((column, i) => {
			var c = column.lastElementChild;
			if ( c ) {
				var card = this.pack.cards[c.idx];
				var start = card.el.parentNode;		
				
				each(holders, function(i,holder) {
					if ( this.isLegalMove(card, holder) && !card.checked ) {
						this.autoStacking = true;
						this.checked = true;
						card.checked = true;
						var prev = card.el.previousElementSibling;

						if ( prev ) {
							var prevCard = this.pack.cards[prev.idx];
							if ( !prevCard.flipped ) {
								prevCard.flip();
								this.score += 5;
							}
						}
						
						this.updateHistory(card, card.el.parentNode, holder);
						
						var crect = rect(card.el);
						var prect = rect(holder);
						
						var x = crect.left - prect.left;
						var y = crect.top - prect.top;	
						
						this.updateScore(card.el.parentNode, holder);
						
						holder.appendChild(card.el);
						start.classList.toggle("empty", !start.childElementCount);
						
						card.el.style.cssText = "transform: translate3d("+x+"px,"+y+"px,0px);";
						
						// Repaint
						card.el.offsetTop;
						
						card.el.style.cssText = "transform: translate3d(0px,0px,0px); transition: transform "+this.animationInterval+"ms;";
						
						setTimeout(() => {
							card.el.style.transform = "";
						}, this.animationInterval)
						
						this.emit("change");
					}
				}, this);
				
			}
		}, this);
		
		var count = 0;
		each(this.stacks.children, function(i, stack) {
			count += stack.childElementCount;
		});
		
		this.won = false;
		if ( count === 52 ) {
			setTimeout(() => {
				this.win();
			}, this.animationInterval);
			return false;
		}
		
		if ( this.checked ) {
			setTimeout(() => {
				this.check();
			}, this.animationInterval);
		}
	};
	
	Game.prototype.start = function() {
		var columns = 7;
		var current = 0;
		var start = 0;

		// Minimize DOM changes
		var columns = this.columns;
		var pack = this.packArea;
		
		this.reset();

		// Shuffle
		this.pack.shuffle();
		
		for (var i = 0; i < 28; i++) {
			var card = this.pack.cards[i];

			/* append the card to the column */
			columns.children[current].appendChild(card.el);
			
			/* flip the card if it is the first one */
			if (start === current) {
				card.flip();
			}

			/* increment the column we're dropping the card in to */
			current++;

			/* increment start position */
			if (current === 7) {
				start++;
				current = start;
			}
		}
		
		for (var i = 28; i < 52; i++) {
			pack.appendChild(this.pack.cards[i].el);
		}

		this.packArea.parentNode.replaceChild(pack, this.packArea);
		this.columns.parentNode.replaceChild(columns, this.columns);
		
		this.packArea = pack;
		this.columns = columns;
		
		this.emit("start");
	};
	
	Game.prototype.hint = function() {
		this.hinted = false;
		var columns = [].slice.call(this.columns.children);
		
		columns.push(this.dealArea);
		
		each(this.stacks, function(i, stack) {
			columns.push(stack);
		});
		
		each(columns, function(i,column) {
			var c;
			if ( column === this.dealArea ) {
				c = column.lastElementChild;
			} else {
				c = column.getElementsByClassName("flipped")[0];
			}

			if ( c ) {
				var card = this.pack.cards[c.idx];
				var isLast, siblings = [];
				var nodeIndex = [].slice.call(card.el.parentNode.children).indexOf(card.el);
				
				if ( card.el.previousElementSibling ) {
					if ( card.el.parentNode === this.dealArea ) {
						isLast = true;
					} else {
						isLast = !card.el.previousElementSibling.classList.contains("flipped")
					}
				}
				
				if ( card.value === 1 || card.el.parentNode.childElementCount === 1 ) {
					isLast = true;
				}
				
				if ( card.value === 13 && card.el.parentNode.classList.contains("column") && card.el.parentNode.childElementCount === 1 ) {
					return false;
				}
				
				each(card.el.parentNode.children, function(i, node) {
					if ( i > nodeIndex ) {
						siblings.push(node);
					}
				});				

				each(columns, function(idx,col) {
					if ( this.isLegalMove(card, col) && isLast && !this.hinted ) {
						var lastCard, last = col.lastElementChild;
						if ( last ) {
							lastCard = this.pack.cards[last.idx].el;
						} else {
							if ( card.value === 13 ) {
								lastCard = col;
							}
						}
						
						card.el.classList.add("hint");
						
						if ( siblings.length ) {
							each(siblings, function(i, node) {
								node.classList.add("hint");
							});
						}
						
						setTimeout(function() {
							card.el.classList.remove("hint");
							
							if ( siblings.length ) {
								each(siblings, function(i, node) {
									node.classList.remove("hint");
								});
							}							
							
							lastCard.classList.add("hint");
							
							setTimeout(function() {
								lastCard.classList.remove("hint");
							}, 500);							
						}, 500);
						
						this.hinted = true;
						// this.score -= 20;
					}
				}, this);
			}
		}, this);
	};
	
	Game.prototype.reset = function() {
		
		this.score = 0;
		this.history = [];		
		
		if ( this.won ) {
			// cancel win animation
			if ( this.frame ) {
				cancelAnimationFrame(this.frame);
			}
			this.won = false;
			document.body.removeChild(this.canvas);
		}
		
		this.pack.cards.forEach(function(card) {
			if ( card.flipped ) {
				card.flip();
			}			
			card.checked = false;
		});
		
		Array.from(this.columns.children).forEach(function(column) {
			column.classList.remove("empty");
		});
		
		Array.from(this.stacks.children).forEach(function(stack) {
			stack.classList.remove("empty");
		});			
		
	};
	
	Game.prototype.win = function() {
		if ( this.won ) {
			return false;
		}
		
		this.won = true;
		
		var rects = [];
		var suits = [];
		
		this.pack.cards.forEach(function(card) {
			card.el.style.transform = "";
		});
		
		each(this.stacks.children, function(i, stack) {
			rects.push(rect(stack));
			
			var last = stack.lastElementChild;
			var card = this.pack.cards[last.idx];
			
			suits.push(card.suit);
		}, this);

		this.canvas = document.createElement("canvas");
		var that = this;
		var ctx = this.canvas.getContext("2d");
		var w = this.canvas.width = window.innerWidth;
		var h = this.canvas.height = window.innerHeight;
		var gravity, wind;
		var pos = new Vector(rects[0].left, rects[0].top);
		var vel = new Vector(0, -getRandomInt(25,30));
		
		var sWidth = 125;
		var sHeight = 188;
		
		this.frame = null;
		var x = 0;
		var sx = sWidth * 12;
		var sy = 0;
		var count = 0;
		
		var init = function() {
			document.body.appendChild(that.canvas);
			setGravity();
			setWind();
			draw();	
		}

		var setGravity = function() {
			gravity = new Vector(0, getRandomInt(1, 9));
		}	

		var setWind = function() {
			var a = [-1,1];
			var r = a[Math.floor(Math.random() * a.length)]
			var w = getRandomInt(5,15);
			wind = new Vector(w * r, 0);
		}
		
		var outline = function(p, w, h) {
			
			var r = 5;
			
			var points = [
				[p.x + r, p.y],
				[p.x + w - r, p.y],
				[p.x + w, p.y + r],
				[p.x + w, (p.y + h) - r],
				[p.x + w - r, p.y + h],
				[p.x + r, p.y + h],
				[p.x, (p.y + h) - r],
				[p.x, p.y + r],
			];
			
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#333";
			
			// Top
			ctx.moveTo(points[0][0], points[0][1]);
			ctx.lineTo(points[1][0], points[1][1]);

			// Top right corner
			ctx.arc(points[1][0], points[2][1], r, 1.5 * Math.PI, 2 * Math.PI);

			// Right side
			ctx.moveTo(points[2][0], points[2][1]);
			ctx.lineTo(points[3][0], points[3][1]);
			
			// Bottom right corner
			ctx.arc(points[4][0], points[3][1], r, 2 * Math.PI, 2.5 * Math.PI);	
			
			// Bottom
			ctx.moveTo(points[4][0], points[4][1]);
			ctx.lineTo(points[5][0], points[5][1]);
			
			// Bottom left corner
			ctx.arc(p.x + r, p.y + h - r, r, 2.5 * Math.PI, 3 * Math.PI);		
			
			// Left side
			ctx.moveTo(points[6][0], points[6][1]);
			ctx.lineTo(points[7][0], points[7][1]);
			
			// Top left
			ctx.arc(points[5][0], points[7][1], r, 3 * Math.PI, 3.5 * Math.PI);
			
			ctx.stroke();				
		};

		var draw = function() {

			that.frame = requestAnimationFrame(draw);

			var img = that.images[suits[x]];

			var dWidth = sWidth;
			var dHeight = sHeight;

			vel.add(gravity);

			pos.add(vel);
			pos.add(wind);

			if (pos.y >= h - sHeight) {
				pos.y = h - sHeight;
				vel.y = -vel.y;
			}	
			
			ctx.fillStyle="#FFFFFF";
			ctx.drawImage(img, sx, sy, sWidth, sHeight, pos.x, pos.y, dWidth, dHeight);			
			
			outline(pos, sWidth, sHeight);		

			if ( pos.x < 0 - sWidth || pos.x > w ) {
				
				if ( x < 3 ) {
					x++;
				} else {
					x = 0;
					sx -= sWidth;
				}
				
				if ( sx > 0 - sWidth ) {
					pos = new Vector(rects[x].left, rects[x].top);
					vel = new Vector(0, -getRandomInt(25,50));
					setGravity();
					setWind();
					count++

					if ( count === 51 ) {
						var newGame = false;
						if ( isFilled(ctx, 0, 0, that.canvas.width,that.canvas.height) ) {
							newGame = confirm("Congrats! You filled the canvas with cards!!!!\n\nStart a new game?");
						} else {
							newGame = confirm("Congrats!\n\nStart a new game?");
						}
						
						if ( newGame ) {
							that.start();
						}
					}
				}
			}	
		}
		
		init();
		setGravity();
		setWind();		
	};
	
	Game.prototype.cheat = function() {
		var that = this;
		this.checked = false;
		var columns = [].slice.call(this.columns.children);
		var holders = this.stacks.children;
		
		columns.push(this.dealArea);
		
		each(this.pack.suits, function(i, suit) {
			var el, card, s;
			
			for( var n = 1; n < 14; n++ ) {
				
				s = n;
				
				if ( n > 10 ) {
					switch(n) {
						case 11:
							s = "J";
							break;
						case 12:
							s = "Q";
							break;
						case 13:
							s = "K";
							break;							
					}
				}
				
				el = document.querySelector(`.card.${suit}.card-${s}`);
				
				card = this.pack.cards[el.idx];
				
				var prev = card.el.previousElementSibling;
				
				if ( !card.flipped && card.el.parentNode !== this.packArea ) {
					card.flip();
				}

				if ( prev && card.el.parentNode !== this.packArea ) {
					var prevCard = this.pack.cards[prev.idx];
					if ( !prevCard.flipped ) {
						prevCard.flip();
						this.score += 5;
					}
				}

				var crect = rect(card.el);
				var prect = rect(holders[i]);

				var x = crect.left - prect.left;
				var y = crect.top - prect.top;	

				holders[i].appendChild(card.el);

				card.el.style.cssText = "transform: translate3d("+x+"px,"+y+"px,0px);";

				// Repaint
				card.el.offsetTop;

				card.el.style.cssText = "transform: translate3d(0px,0px,0px); transition: transform "+this.animationInterval+"ms;";
				
				setTimeout(function() {
					card.el.style.transform = "";
				}, this.animationInterval)				
			}
		}, this);
		
		setTimeout(function() {
			that.win();
		}, this.animationInterval);
	};
	
	function isFilled(ctx,x,y,w,h) {

		var idata = ctx.getImageData(x,y,w,h),
			u32 = new Uint32Array(idata.data.buffer),
			i = 0, len = u32.length;

		while(i < len) if (!u32[i++]) return false;
		return true;
	}	

	global.Game = Game;
}(this));

var controls = document.getElementById("controls");
var score = document.getElementById("score");
var game = new Game("#container");

game.start();

game.on("start", function() {
	score.textContent = "Score: " + this.score;
});


game.on("change", function() {
	score.textContent = "Score: " + this.score;
});

controls.addEventListener("click", function(e) {
	var t = e.target;
	if ( t.nodeName === "BUTTON" ) {
		var action = t.getAttribute("data-action");
		game[action]();
	}
}, false);