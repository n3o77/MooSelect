var MooSelect = new Class({
    
    Implements: [Options, Events],
    
    currentSelection: null,
    selectField: null,
    selected: null,
    list: null,
    ddOpened: false,
    options: {
        'displayEl': 'div',
        'displayHtml': '${"name"}',
        'displayClass': null,
        'listType': 'ul',
        'selectableHtml': '${"name"}',
        'defaultVar': '${"name"}',
        'id': null,
        'dropDownId': 'null',
        'extraClass': '',
        'selectFieldStyles': {'position': 'absolute', 'left': '-99999px', 'top': '-99999px'}
    },
    
    initialize: function(selectField, options) {
        this.setOptions(options);
        this.selectField = $(selectField);
        
        var currentSelectedText = this.selectField.getSelected()[0].getProperty('text');
        this.selected = {'value': this.selectField.getProperty('value') || currentSelectedText, 'text': currentSelectedText};
        this.replaceField();
    },
    
    replaceField: function() {
        var id = this.options.id || this.selectField.getProperty('id');
        
        this.currentSelection = new Element(this.options.displayEl, {'class': this.options.displayClass || this.selectField.getProperty('class'), 'id': id}).inject(this.selectField, 'before');
        this.updateCurrentSelection();
        
        this.selectField.setStyles(this.options.selectFieldStyles);
        
        this.fireEvent('created');
        this.loadEvents();
    },
    
    updateCurrentSelection: function() {
        var html = this.options.displayHtml.replace(this.options.defaultVar, this.selected.text);
        this.currentSelection.set('html', html);
    },
    
    getDropDown: function() {
        if (this.list) {
            return this.list;
        }
        
        var classes = this.selectField.getProperty('class') + " " + this.options.extraClass;
        
        this.list = new Element(this.options.listType, {'id': this.options.dropDownId, 'class': classes});
        
        var options = this.selectField.getChildren();
        options.each(function(item) {
            var liHtml = this.options.selectableHtml.replace(this.options.defaultVar, item.getProperty('text'));
            var value = item.getProperty('value');
            var listEl = new Element('li', {'html': liHtml}).inject(this.list);
            if (this.selected.value == value) {
                listEl.addClass('selected');
            }

            listEl.store('value', value);
            listEl.store('text', item.getProperty('text'));
        }, this);
        
        return this.list;
    },
    
    updateSelectField: function() {
        var options = this.selectField.getChildren();
        options.set('selected', false);
        options.each(function(item) {
            if (this.selected.value == (item.getProperty('value') || item.getProperty('text'))) {
                item.set('selected', 'selected');
            }
        }, this);
        this.selectField.fireEvent('change');
    },
    
    loadEvents: function() {
        this.currentSelection.addEvent('click', this.toggleDropDown.bind(this));
        this.getDropDown().addEvent('click:relay(li)', this.selectSelection.bind(this));
    },
    
    toggleDropDown: function(event) {
        if (this.ddOpened) {
            this.closeDropDown(event);
        } else {
            this.openDropDown(event);
        }
    },
    
    openDropDown: function(event) {
        event.stop();
        
        var dd = this.getDropDown();
        dd.inject(document.body);
        this.positionDropDown();
        
        this.boundCloseDropDownFunction = this.closeDropDown.bind(this);
        window.addEvent('click', this.boundCloseDropDownFunction);
        
        this.boundWindowResizeFunction = this.positionDropDown.bind(this);
        window.addEvent('resize', this.boundWindowResizeFunction);
        
        this.ddOpened = true;
    },
    
    positionDropDown: function() {
        var coord = this.currentSelection.getCoordinates();
        this.list.setStyles({'position': 'absolute', 'left': coord.left, 'top': coord.top, 'z-index': '999999'});
    },
    
    closeDropDown: function() {
        this.list.dispose();
        window.removeEvent('click', this.boundCloseDropDownFunction);
        window.removeEvent('resize', this.boundWindowResizeFunction);
        this.ddOpened = false;
    },
    
    selectSelection: function(event, element) {
        this.list.getElements('li').removeClass('selected');
        this.selected.value = element.retrieve('value') || element.retrieve('text');
        this.selected.text = element.retrieve('text');
        this.updateCurrentSelection();
        this.updateSelectField();
    }
    
});