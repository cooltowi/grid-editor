class GridEditor {
    protected $element:JQuery;
    protected data:{};

    protected output:JQuery;

    public constructor(element:string, data:{}) {

        this.$element = $(element);
        this.data = data;

        this.renderGrid(this.data.content);
        this.bindEvents();

        this.displayJson(this.data);

        this.$element.append(this.output);
        this.runDrag();
        this.setElements();
    }

    public bindEvents() {
        let name = $('#editModal').find('#edit-name');
        let grid = $('#editModal').find('#edit-grid');
        let elementClass = $('#editModal').find('#edit-class');

        $(document).on('click', '.removeElement', (e:Event) => {
            let $el = $(e.currentTarget);

            this.removeElement($el);
            this.renderGrid(this.data.content);
            this.$element.html('').append(this.output);
        });

        $(document).on('click', '.addBoxElement', (e:Event) => {
            let button = $(e.currentTarget);
            this.addElement(button.data('action'), 13, 'new box');
        });

        $('#addModal').on('show.bs.modal', (e:Event) => {
            let button = $(e.relatedTarget);
            let recipient = button.data('action');
            this.recipient = recipient;
        });

        $('#editModal').on('show.bs.modal', (e:Event) => {
            let button = $(e.relatedTarget);
            this.button = button;
            name.val(button.data('name'));
            grid.val(button.data('grid'));
            elementClass.val(button.data('class'));
        });

        $('#addElementBox').on('click', () => {
            let type = $('#grid-type').val();
            this.addElement(this.recipient, type, 'New element');
        });

        $('#editElementBox').on('click', () => {
            this.editElement(this.button.data('action'), grid.val(), name.val(), elementClass.val());
        });

        this.renderGrid(this.data.content);
    }

    public render(data:{}) {
        this.$element.html('').append(this.renderGrid(data.content));
        this.displayJson(data);
        this.runDrag();
    }

    public editElement(elementId:number, grid:number, name:string, elementClass:string) {
        $.each(this.data.content, (index, data) => {
            if (data != null && data.id == elementId) {
                data.grid = grid;
                data.name = name;
                data.additionalClass = elementClass;
            }
        });
        this.render(this.data);
    }

    public setParent(element:number, parent:number) {
        $.each(this.data.content, (index, data) => {
            if (data != null && data.id == element) {
                data.parentId = parent;
            }
        });
        this.render(this.data);
    }

    public setOrder(element:number, order:number) {
        order += 1;
        $.each(this.data.content, (index, data) => {
            if (data != null && data.id == element) {
                data.order = order;
                console.log(data.id + ':' order);
            }
            //console.log(order);
        });
        this.render(this.data);
    }

    public addElement(parentId:number, type:number, name:string) {
        this.data.content.push({
            id: this.getRandomInt(100000, 999999),
            grid: type,
            parentId: parentId,
            name: name,
            order: 0,
            additionalClass: '',
            content: '',
        });
        this.render(this.data);
    }

    public removeChild(parentId:number) {
        $.each(this.data.content, (index, data) => {
            if (data != null) {
                if (data.parentId == parentId) {
                    this.removeElementById(data.id);
                }
            }
        });
    }

    public removeElement($el):JQuery {

        let indexAction = $el.data('action');

        this.removeElementById(indexAction);

        this.displayJson(this.data);

    }

    public removeElementById(id:number):JQuery {

        let indexAction = id;

        $.each(this.data.content, (index, data) => {
            if (data != null) {
                if (data.id == indexAction) {
                    delete this.data.content[index];
                    this.removeChild(data.id);
                }
            }
        });
    }

    public renderGrid(data:{}):JQuery {

        let outputList = $('<div>');

        data = this.sortBoxes(data);

        $.each(data, (index, data) => {
            if (data != null && data.grid != 13) {
                let elementClass;
                let additionalClass = '';
                let gridContent = '';
                if (data.grid == 0) {
                    elementClass = 'row';
                } else {
                    elementClass = 'col-md-' + data.grid;
                    gridContent = $('<div>').addClass('elementContent el_' + data.id).attr('data-el', data.id).append(this.renderBoxControls(data));
                }
                if (typeof data.additionalClass != 'undefined') {
                    additionalClass = data.additionalClass;
                }
                if (data.parentId == '') {
                    outputList.append($('<div>').addClass(elementClass + ' vc_id_' + data.id + ' ' + additionalClass).html('<label>' + data.name + '</label>').append(this.renderControls(data)));
                } else {
                    outputList.find('.vc_id_' + data.parentId).append($('<div>').addClass(elementClass + ' vc_id_' + data.id + ' ' + additionalClass).html('<label>' + data.name + '</label>').append(gridContent).append(this.renderControls(data)));
                }
            }
        });
        this.output = outputList;
        this.output = this.renderElements(data, this.output);
        return this.output;
    }

    public renderElements(data:{}, gridCore):JQuery {
        $.each(data, (index, data) => {
            if (data != null && data.grid == 13) {
                let additionalClass = '';
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
    }

    public displayJson(data:{}):JQuery {
        data.content = this.sortBoxes(data.content);
        $('pre').html(JSON.stringify(data, null, "\t"));
    }

    public renderControls(data:{}):JQuery {
        return $('<div>').addClass('controls btn-group').append(
            $('<button>').addClass('btn btn-xs btn-primary addElement').attr('data-action', data.id).attr('data-target', '#addModal').attr('data-toggle', 'modal').html('<i class="fa fa-plus" aria-hidden="true"></i>'),
            $('<button>').addClass('btn btn-xs btn-primary editElement').attr('data-action', data.id).attr('data-grid', data.grid).attr('data-name', data.name).attr('data-class', data.additionalClass).attr('data-content', data.content).attr('data-target', '#editModal').attr('data-toggle', 'modal').html('<i class="fa fa-edit" aria-hidden="true"></i>'),
            $('<button>').addClass('btn btn-xs btn-danger removeElement').attr('data-action', data.id).html('<i class="fa fa-trash" aria-hidden="true"></i>')
        );
    }

    public renderBoxControls(data:{}):JQuery {
        return $('<div>').addClass('controls btn-group').append(
            $('<button>').addClass('btn btn-xs btn-primary addBoxElement').attr('data-action', data.id).html('<i class="fa fa-plus" aria-hidden="true"></i>')
        );
    }

    public getRandomInt(min:number, max:number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    protected sortables:[] = [];

    public runDrag() {
        var arr = document.getElementsByClassName('elementContent');
        var self = this;
        [].forEach.call(arr, function (el) {
            let sortableElement = Sortable.create(el, {
                ghostClass: '.elementContent',
                group: 'box',
                animation: 150,
                draggable: '.box',
                store : {
                    set : function (sortable) {
                        var order = sortable.toArray();
                        //console.log('set');
                        self.updateBoxSort(order);
                    },
                    get : function (sortable) {
                        return [];
                    }
                },

                onUpdate: function (evt:Event) {
                    let elementId = $(evt.item).data('id');
                    //self.setOrder(elementId, evt.newIndex + 1);
                },

                onAdd: function (evt:Event) {
                    let newParentId = $(evt.to).data('el');
                    let elementId = $(evt.item).data('id');
                    self.setParent(elementId, newParentId);
                    self.setOrder(elementId, evt.newIndex);
                    console.log(evt);
                },

                onChoose: function(evt:Event) {
                    console.log(evt);
                    console.log('choose');
                    //let elementId = $(evt.item).data('id');
                    //self.setOrder(elementId, evt.oldIndex + 1);
                    //self.displayJson(self.data);
                },
            });
            self.sortables.push(sortableElement);
        });
    }

    public setElements() {

    }

    public updateBoxSort(data:{}) {
        //console.log(data);
        $.each(data, (index, data) => {
            this.setOrder(data, index);
        });
        this.render(this.data);
    }

    public getElements(value) {
        return value.grid != 13;
    }

    public getBoxes(value) {
        return value.grid == 13;
    }

    public sortBoxes(data:{}) {
        let elements = data.filter(this.getElements);
        let boxes = data.filter(this.getBoxes);
        boxes.sort(function (a, b) {
            return a.order - b.order;
        });
        let dataOutput = elements.concat(boxes);
        return dataOutput;
    }

}

let ge = new GridEditor('#gridEditor', sampleData);
