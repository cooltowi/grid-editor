var GridEditor = (function () {
    function GridEditor(element, data) {
        this.link = 'http://localhost/';
        this.sortables = [];
        this.$element = $(element);
        this.data = data;
        this.renderGrid(this.data.content);
        this.bindEvents();
        this.displayJson(this.data);
        this.$element.append(this.output);
        this.runDrag();
        this.setElements();
    }
    GridEditor.prototype.bindEvents = function () {
        var _this = this;
        var name = $('#editModal').find('#edit-name');
        var grid = $('#editModal').find('#edit-grid');
        var elementClass = $('#editModal').find('#edit-class');
        self = this;
        $(document).on('click', '.removeElement', function (e) {
            var $el = $(e.currentTarget);
            _this.removeElement($el);
            _this.renderGrid(_this.data.content);
            _this.$element.html('').append(_this.output);
        });
        $(document).on('click', '#addElementBoxSecond', function (e) {
            console.log('click');
        });
        // $(document).on('click', '.addBoxElement', (e:Event) => {
        //     let button = $(e.currentTarget);
        //     this.addElement(button.data('action'), 13, 'new box');
        // });
        $('#addModal').on('show.bs.modal', function (e) {
            var button = $(e.relatedTarget);
            var recipient = button.data('action');
            _this.recipient = recipient;
        });
        $('#editModal').on('show.bs.modal', function (e) {
            var button = $(e.relatedTarget);
            _this.button = button;
            name.val(button.data('name'));
            grid.val(button.data('grid'));
            elementClass.val(button.data('class'));
        });
        $('#addModalBox').on('show.bs.modal', function (e) {
            $.get(_this.link + '/module/list', function (data) {
                if (data.success) {
                    self.showBoxes(data);
                }
            });
        });
        $('#addModalBox').on('hide.bs.modal', function (e) {
            $(e.target).find('#boxContent').fadeOut();
            $(e.target).find('.loader-box').fadeIn();
            $(e.target).find('#addElementBoxSecond').prop("disabled", true);
            $(e.target).find('#box-type').html(' ');
        });
        $('#addElementBox').on('click', function () {
            var type = $('#grid-type').val();
            _this.addElement(_this.recipient, type, 'New element');
        });
        $('#editElementBox').on('click', function () {
            _this.editElement(_this.button.data('action'), grid.val(), name.val(), elementClass.val());
        });
        this.renderGrid(this.data.content);
    };
    GridEditor.prototype.render = function (data) {
        this.$element.html('').append(this.renderGrid(data.content));
        this.displayJson(data);
        this.runDrag();
    };
    GridEditor.prototype.editElement = function (elementId, grid, name, elementClass) {
        $.each(this.data.content, function (index, data) {
            if (data != null && data.id == elementId) {
                data.grid = grid;
                data.name = name;
                data.additionalClass = elementClass;
            }
        });
        this.render(this.data);
    };
    GridEditor.prototype.setParent = function (element, parent) {
        $.each(this.data.content, function (index, data) {
            if (data != null && data.id == element) {
                data.parentId = parent;
            }
        });
        this.render(this.data);
    };
    GridEditor.prototype.setOrder = function (element, order) {
        order += 1;
        $.each(this.data.content, function (index, data) {
            if (data != null && data.id == element) {
                data.order = order;
            }
        });
        this.render(this.data);
    };
    GridEditor.prototype.addElement = function (parentId, type, name) {
        this.data.content.push({
            id: this.getRandomInt(100000, 999999),
            grid: type,
            parentId: parentId,
            name: name,
            order: 0,
            additionalClass: '',
            content: ''
        });
        this.render(this.data);
    };
    GridEditor.prototype.addBoxElement = function (parentId, type, name) {
        this.data.content.push({
            id: this.getRandomInt(100000, 999999),
            grid: type,
            parentId: parentId,
            name: name,
            order: 0,
            additionalClass: '',
            content: ''
        });
        this.render(this.data);
    };
    GridEditor.prototype.showBoxes = function (data) {
        console.log(data);
        $.each(data.pageModules, function (index, data) {
            $('#box-type').append('<option value=' + data.id + '>' + data.name + '</option>');
        });
        $('#addElementBoxSecond').prop('disabled', false);
        $('.loader-box').fadeOut();
        $('#boxContent').fadeIn();
    };
    GridEditor.prototype.removeChild = function (parentId) {
        var _this = this;
        $.each(this.data.content, function (index, data) {
            if (data != null) {
                if (data.parentId == parentId) {
                    _this.removeElementById(data.id);
                }
            }
        });
    };
    GridEditor.prototype.removeElement = function ($el) {
        var indexAction = $el.data('action');
        this.removeElementById(indexAction);
        this.displayJson(this.data);
    };
    GridEditor.prototype.removeElementById = function (id) {
        var _this = this;
        var indexAction = id;
        $.each(this.data.content, function (index, data) {
            if (data != null) {
                if (data.id == indexAction) {
                    delete _this.data.content[index];
                    _this.removeChild(data.id);
                }
            }
        });
    };
    GridEditor.prototype.renderGrid = function (data) {
        var _this = this;
        var outputList = $('<div>');
        data = this.sortBoxes(data);
        $.each(data, function (index, data) {
            if (data != null && data.grid != 13) {
                var elementClass = void 0;
                var additionalClass = '';
                var gridContent = '';
                if (data.grid == 0) {
                    elementClass = 'row';
                }
                else {
                    elementClass = 'col-md-' + data.grid;
                    gridContent = $('<div>').addClass('elementContent el_' + data.id).attr('data-el', data.id).append(_this.renderBoxControls(data));
                }
                if (typeof data.additionalClass != 'undefined') {
                    additionalClass = data.additionalClass;
                }
                if (data.parentId == '') {
                    outputList.append($('<div>').addClass(elementClass + ' vc_id_' + data.id + ' ' + additionalClass).html('<label>' + data.name + '</label>').append(_this.renderControls(data)));
                }
                else {
                    outputList.find('.vc_id_' + data.parentId).append($('<div>').addClass(elementClass + ' vc_id_' + data.id + ' ' + additionalClass).html('<label>' + data.name + '</label>').append(gridContent).append(_this.renderControls(data)));
                }
            }
        });
        this.output = outputList;
        this.output = this.renderElements(data, this.output);
        return this.output;
    };
    GridEditor.prototype.renderElements = function (data, gridCore) {
        $.each(data, function (index, data) {
            if (data != null && data.grid == 13) {
                var additionalClass = '';
                if (typeof data.additionalClass != 'undefined') {
                    additionalClass = data.additionalClass;
                }
                if (data.parentId != '') {
                    gridCore.find('.el_' + data.parentId).append($('<div>').addClass('box vc_box_id_' + data.id + ' ' + additionalClass).attr('data-order', data.order).attr('data-id', data.id).html('<span>' + data.name + '</span>'));
                }
            }
        });
        this.output = gridCore;
        return this.output;
    };
    GridEditor.prototype.displayJson = function (data) {
        data.content = this.sortBoxes(data.content);
        $('pre').html(JSON.stringify(data, null, "\t"));
    };
    GridEditor.prototype.renderControls = function (data) {
        return $('<div>').addClass('controls btn-group').append($('<button>').addClass('btn btn-xs btn-primary addElement').attr('data-action', data.id).attr('data-target', '#addModal').attr('data-toggle', 'modal').html('<i class="fa fa-plus" aria-hidden="true"></i>'), $('<button>').addClass('btn btn-xs btn-primary editElement').attr('data-action', data.id).attr('data-grid', data.grid).attr('data-name', data.name).attr('data-class', data.additionalClass).attr('data-content', data.content).attr('data-target', '#editModal').attr('data-toggle', 'modal').html('<i class="fa fa-edit" aria-hidden="true"></i>'), $('<button>').addClass('btn btn-xs btn-danger removeElement').attr('data-action', data.id).html('<i class="fa fa-trash" aria-hidden="true"></i>'));
    };
    GridEditor.prototype.renderBoxControls = function (data) {
        return $('<div>').addClass('controls btn-group').append($('<button>').addClass('btn btn-xs btn-primary addBoxElement').attr('data-action', data.id).attr('data-target', '#addModalBox').attr('data-toggle', 'modal').html('<i class="fa fa-plus" aria-hidden="true"></i>'));
    };
    GridEditor.prototype.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    GridEditor.prototype.runDrag = function () {
        var arr = document.getElementsByClassName('elementContent');
        var self = this;
        [].forEach.call(arr, function (el) {
            var sortableElement = Sortable.create(el, {
                ghostClass: '.elementContent',
                group: 'box',
                animation: 150,
                draggable: '.box',
                store: {
                    set: function (sortable) {
                        var order = sortable.toArray();
                        //console.log('set');
                        self.updateBoxSort(order);
                    },
                    get: function (sortable) {
                        return [];
                    }
                },
                onUpdate: function (evt) {
                    var elementId = $(evt.item).data('id');
                    //self.setOrder(elementId, evt.newIndex + 1);
                },
                onAdd: function (evt) {
                    var newParentId = $(evt.to).data('el');
                    var elementId = $(evt.item).data('id');
                    self.setParent(elementId, newParentId);
                    self.setOrder(elementId, evt.newIndex);
                    console.log(evt);
                },
                onChoose: function (evt) {
                    console.log(evt);
                    console.log('choose');
                    //let elementId = $(evt.item).data('id');
                    //self.setOrder(elementId, evt.oldIndex + 1);
                    //self.displayJson(self.data);
                }
            });
            self.sortables.push(sortableElement);
        });
    };
    GridEditor.prototype.setElements = function () {
    };
    GridEditor.prototype.updateBoxSort = function (data) {
        var _this = this;
        //console.log(data);
        $.each(data, function (index, data) {
            _this.setOrder(data, index);
        });
        this.render(this.data);
    };
    GridEditor.prototype.getElements = function (value) {
        return value.grid != 13;
    };
    GridEditor.prototype.getBoxes = function (value) {
        return value.grid == 13;
    };
    GridEditor.prototype.sortBoxes = function (data) {
        var elements = data.filter(this.getElements);
        var boxes = data.filter(this.getBoxes);
        boxes.sort(function (a, b) {
            return a.order - b.order;
        });
        var dataOutput = elements.concat(boxes);
        return dataOutput;
    };
    return GridEditor;
}());
var ge = new GridEditor('#gridEditor', sampleData);
//# sourceMappingURL=Editor.js.map