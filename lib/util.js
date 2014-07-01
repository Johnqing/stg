var util = {
	/**
	 * extend
	 * @param  {[type]} old [description]
	 * @param  {[type]} n   [description]
	 * @return {[type]}     [description]
	 */
	extend: function(old, n){
		if(!n) return old;

		for(var key in n){
			old[key] = n[key];
		};

		return old;
	}
}

module.exports = util;