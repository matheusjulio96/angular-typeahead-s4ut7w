import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Angular';

  
  items = [{name:'matheus'},{name:'julio'},{name:'gustavo'},{name:'jose'},{name:'mario'}];
  item;

  getHintObj = (hint: string) => { 
    return this.items.filter(i => i.name.toLowerCase().indexOf(hint.toLowerCase()) >= 0);
  }

  onSelectionMade(obj) {
    console.log(obj);
    this.item = obj;
  }

  onRemoveSelectedItem() {
    this.item = undefined;
  }

}
