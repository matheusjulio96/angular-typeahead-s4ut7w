import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  TemplateRef,
  ContentChildren,
  Directive,
  EventEmitter
} from "@angular/core";

@Component({
  selector: "app-typeahead",
  templateUrl: "./typeahead.component.html",
  styleUrls: ["./typeahead.component.css"]
})
export class TypeaheadComponent implements OnInit {
  @Input() placeholder: string = "";
  @Input() getHintItems;
  @Input() name: string;
  @Input() inputClass: string;
  @Input() style: string;
  @Input() selectedValue: string;
  @Input() valueField: string;

  @Output() onSelectionMade: EventEmitter<any> = new EventEmitter();
  @Output() onRemoveSelectedItem: EventEmitter<any> = new EventEmitter();

  itemTemplate: TemplateRef<any>;

  _isSelected = false;
  _lostFocusOne = false;
  dirty = false;

  mouseOverDropmenu = false;
  active_id = -1;
  lastInputedValue;
  _isOpen = false;
  classValidation = "";
  classMostrar = "";

  get lostFocusOne() {
    return this._lostFocusOne;
  }
  set lostFocusOne(value) {
    if(this.dirty){
      this._lostFocusOne = value;
    }
    this.inputClassValidation();
  }
  get isSelected() {
    return this._isSelected;
  }
  set isSelected(value) {
    this._isSelected = value;
    this.inputClassValidation();
  }

  get isOpen() {
    return this._isOpen;
  }
  set isOpen(value) {
    this._isOpen = value;
    this.mostrar();
  }

  items = [];
  @ContentChildren("hello") templates;

  @ViewChild("input", { static: true }) input;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {}

  ngAfterContentInit() {
    this.templates.forEach(t => (this.itemTemplate = t));
  }

  valido() {
    return this.isSelected || !this.lostFocusOne;
  }

  classValidationValue() {
    return this.valido()
      ? "valid modified feedback-icon"
      : "invalid modified feedback-icon";
  }

  inputClassValidation() {
    //console.log('validation'); // <<< ===== ARRUMAR
    this.classValidation = (this.lostFocusOne && this.dirty) ? ` ${this.classValidationValue()}` : "";
  }

  mostrar() {
    this.classMostrar = this.isOpen ? " show" : "";
  }

  onMouseOverDropmenu() {
    this.mouseOverDropmenu = true;
  }
  onMouseOutDropmenu() {
    this.mouseOverDropmenu = false;
  }

  onFocusOut() {
    this.lostFocusOne = true;

    if (!this.mouseOverDropmenu) {
      this.isOpen = false;
    }

    this.clearLostFocus();
  }

  onFocusIn() {
    if (this.items.length > 0 && !this.isSelected) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
  }

  clearLostFocus(){
    if (!this.isSelected) {
      this._selectedText = this.lastInputedValue;
      if (this.active_id != -1) {
        this.items[this.active_id].item2 = false;
      }
      this.active_id = -1;
    }
  }

  onKeyDownInput(ev: KeyboardEvent) {
    let keyValue = ev.key;

    if (keyValue.length <= 1) {
      //eh letra, nao tem porque verificar nada
      return;
    }

    if ((keyValue == "Tab" && ev.shiftKey) || keyValue == "Escape") {
      this.isOpen = false;
      this.clearLostFocus();
      return;
    }

    if (keyValue == "Enter") {
      if (this.active_id != -1) {
        this.trySelect(this.items[this.active_id].item1);
      }
      return;
    }

    if (
      keyValue == "Tab" &&
      !ev.shiftKey &&
      this.isOpen &&
      this.items.length > 0
    ) {
      ev.preventDefault();
      if (this.active_id != -1) {
        this.trySelect(this.items[this.active_id].item1);
      } else {
        this.trySelect(this.items[0].item1);
      }
    } else {
      if (keyValue == "ArrowUp" || keyValue == "ArrowDown") {
        ev.preventDefault();
        if (this.isOpen) {
          this.keyCheck(keyValue);
        }
      }
    }
  }

  keyCheck(key) {
    const count = this.items.length;

    if (this.active_id != -1) {
      this.items[this.active_id].item2 = false;
    }
    switch (key) {
      case "ArrowDown":
        this.active_id++;
        break;
      case "ArrowUp":
        this.active_id--;
        break;
      case "":
        this.active_id = 0;
        break;
    }

    if (this.active_id < -1) this.active_id += count + 1;
    if (this.active_id >= count) this.active_id = -1;

    if (this.active_id >= 0 && this.active_id <= count) {
      this.items[this.active_id].item2 = true;
      this._selectedText = this.getObjValueField(
        this.items[this.active_id].item1
      );
    }

    if (this.active_id == -1) {
      this._selectedText = this.lastInputedValue;
    }
  }

  _selectedText = "";
  get selectedText() {
    return this._selectedText;
  }
  set selectedText(value) {
    this.dirty = true;
    this._selectedText = value;
    this.lastInputedValue = this._selectedText;
    this.active_id = -1;
    if (this.isSelected) {
      this.onRemoveSelectedItem.emit();
    }
    this.isSelected = false;    
    this.inputClassValidation();

    if (this._selectedText.trim().length > 0) {
      this.throttle();
    } else {
      this.clearItems();
      this.isOpen = false;
    }
  }

  async throttle() {
    let startLength = this._selectedText.length;
    await this.delay(300);
    if (startLength == this._selectedText.length) {
      this.tryAutoComplete();
    }
  }

  tryAutoComplete() {
    let items = this.getHintItems(this._selectedText);

    this.items = items.map(i => {
      return { item1: i, item2: false };
    });

    if (!this.isSelected) {
      this.isOpen = this.items.length > 0;
    }
  }

  trySelectClick(item) {
    this.trySelect(item);
  }

  trySelect(item) {
    this.isOpen = false;
    this._selectedText = this.getObjValueField(item);
    this.isSelected = true;

    this.onSelectionMade.emit(item);
    this.clearItems();
    this.input.nativeElement.focus();

    this.lostFocusOne = true;
  }

  clearItems() {
    this.items = [];
  }

  getObjValueField(obj) {
    var key = Object.keys(obj).findIndex(k => k == this.valueField) as number;
    var value = (Object as any).values(obj)[key] as string;
    return value;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
