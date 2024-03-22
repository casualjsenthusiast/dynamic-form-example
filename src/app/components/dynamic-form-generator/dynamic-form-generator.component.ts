import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';

@Component({
  selector: 'app-dynamic-form-generator',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './dynamic-form-generator.component.html',
  styleUrl: './dynamic-form-generator.component.scss'
})
export class DynamicFormGeneratorComponent implements OnInit {
  billGenerated = false;
  ordersForm!: FormGroup;
  // List of controls for each row that would map to actual FormControls
  controlsArray = [
    { name: 'item', placeholder: 'Select an item', type: 'select', label: 'Item' },
    { name: 'quantity', placeholder: 'Enter Quantity', type: 'number', label: 'Quantity'},
    { name: 'totalPrice', placeholder: '00', type: 'text', label: 'Total Price' }
  ];
  // List of items to be displayed in the dropdown
  items = [
    { name: 'Espresso', price: '249', id: 0 },
    { name: 'Americano', price: '299', id: 1 },
    { name: 'Cappuccino', price: '199', id: 2 },
    { name: 'Latte', price: '349', id: 3 },
    { name: 'Mocha', price: '249', id: 4 },
    { name: 'Cortado', price: '299', id: 5 }
  ];
  generatedBillArray: any = [];

  constructor(
    private readonly formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.ordersForm = this.formBuilder.group({
      rows: this.formBuilder.array([])
    });
  }

  get rows(): FormArray {
    return (this.ordersForm.get('rows') as FormArray);
  }

  get rowsControls(): AbstractControl[] {
    return this.rows.controls;
  }

  getItemNameFromId(id: number) {
    return this.items.find(item => item.id === id)?.name || '';
  }

  /**
   * Returns the FormGroup instance at a particular index
   * @param index 
   * @returns 
   */
  getFormGroupAtIndex(index: number) {
    return (this.rowsControls[index] as FormGroup);
  }
  
  addRow() {
    let row = this.formBuilder.group({
      item: [null, Validators.required],
      quantity: [null, Validators.required],
      totalPrice: [null]
    });
    
    row.controls['totalPrice'].disable();
    
    this.rows.push(row);
  }
  
  deleteRow(index: number) {
    this.rows.removeAt(index);
  }
 
  /**
   * Helper method to calculate the total price of the item selected
   * Total price = Item Price * Quantity Selected
   * @param rowIndex
   */
  calculateTotalPrice(rowIndex: number) {
    let rowControlValue = this.rowsControls[rowIndex].getRawValue();
    let itemPrice = +rowControlValue['item']?.['price'] ?? 0;
    let itemQuantity = +rowControlValue['quantity'] ?? 0;
    let totalPrice = itemPrice * itemQuantity;

    this.rowsControls[rowIndex].get('totalPrice')?.setValue(totalPrice || null);
  }

  onSubmit() {
    of(true).subscribe(response => this.billGenerated = response);
    this.generateBill();
    // reset orders form
    this.ordersForm = this.formBuilder.group({
      rows: this.formBuilder.array([])
    });
  }

  generateBill() {
    let itemPriceMapping: any = {};
    this.rowsControls.forEach(row => {
      let rowValue = row.getRawValue();
      let itemId = rowValue['item'].id;
      if (itemId in itemPriceMapping) {
        itemPriceMapping[itemId] += rowValue['totalPrice'];
      } else {
        itemPriceMapping[itemId] = rowValue['totalPrice'];
      }
    });

    this.generatedBillArray = Object.keys(itemPriceMapping).map((key) => {
      return { name: this.getItemNameFromId(+key), totalPrice: itemPriceMapping[key] }
    });

    // calculate total amount of the bill and push it to the array
    let totalAmount = this.generatedBillArray.reduce((acc: number, curr: any) => {
      return acc + curr['totalPrice'];
    }, 0);

    this.generatedBillArray.push({ name: 'Total Amount', totalPrice: totalAmount });
  }
}
