import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
// import * as jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
const jsPDF = require('jspdf');

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  todoData: any;
  todoForm!: FormGroup;
  updateBtn : boolean = false;
  todoDatas: any;
  showSpinner : boolean = false;
  transtimer: any;
  selectedIndex: any = 1;

constructor(
  private api : ApiService,
  public fb : FormBuilder,
  private toastr: ToastrService,
  ){
  this.getData();
  
  this.todoForm = fb.group({
    id : [null],
    status: [''],
    text: new FormControl('',Validators.required),
    title: new FormControl('',Validators.required)

  })
}

  ngOnInit(): void {
  }

  getData(){
    this.api.getData().subscribe(res => {
      this.todoData = this.todoDatas = res;
    })
  }

  postData(){
    var body = {
      "status": false,
      "text": this.todoForm.value.text,
      "title": this.todoForm.value.title
    }
    this.api.postData(body).subscribe(res => {
      if(res){
        this.showSpinner = true;
        this.transtimer = setTimeout(() => {
          this.toastr.success('Success', 'ToDo, Added');
          this.getData();
          this.todoForm.reset();
          this.showSpinner = false;
         },  1500);
      
      }
    })
  }

  clearForm(){
    this.todoForm.reset();
    this.updateBtn = false;
  }

  downloadPDF(): void {
    const doc = new jsPDF();

    let pdfTable = `<div id="pdfTable"> <h1>Todo List</h1><table>
    <tr><th>Name</th><th>Description</th><th>Status</th></tr>`;
    for (const todo of this.todoData){
      pdfTable = `${pdfTable}<tr> <td>${todo.title}</td><td>${todo.text}</td><td>${todo.status}</td> </tr>`;
    }
    pdfTable = `${pdfTable}</table></div>`;


    doc.fromHTML(pdfTable, 15, 15, {
      width: 190
    });

    doc.save('todo.pdf');
  }

  downloadExcel(): void {
    this.exportAsExcelFile(this.todoData, 'todo');
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  deleteTodo(id:any){
   this.api.deleteData(id).subscribe(res => {
    this.showSpinner = true;
    this.transtimer = setTimeout(() => { 
      this.toastr.success('Deleted Successfully');
      this.getData()
      this.showSpinner = false;
     }, 1000);
   }) 
  }

  editSave: any = []
  editData(data: any){  
    this.editSave = data.id
    this.updateBtn = true;
    this.todoForm.patchValue({
      text : data.text,
      title : data.title,
    })
  }
  updateTodo(){
    var body = {
      "status": this.todoForm.value.status,
      "text": this.todoForm.value.text,
      "title": this.todoForm.value.title
    }
    this.api.editTodo(this.editSave,body).subscribe(res => {
      if(res){
        this.showSpinner = true;
        this.transtimer = setTimeout(() => { 
          this.toastr.success('Successfully', 'ToDo, Updated');
          this.getData()
          this.clearForm()
          this.showSpinner = false;
         }, 1500);
      
      }
      else{
        this.toastr.error('Failed', 'ToDo Not Updated');
      }
    })
  }

  todoCompleted(data: any){
    this.todoForm.patchValue({
      text : data.text,
      title : data.title,
    })

    var body ={
      "status": true,
      "text": this.todoForm.value.text,
      "title": this.todoForm.value.title
    }
    this.api.editTodo(data.id,body).subscribe(res => {
      if(res){
        this.showSpinner = true;
        this.transtimer = setTimeout(() => { 
          this.toastr.success('Success', 'Marked As Completed')
          this.getData();
          this.showSpinner = false;
         }, 500);
        this.todoForm.reset();
      }
  
    })
  }

  todoInCompleted(data: any){
    this.todoForm.patchValue({
      text : data.text,
      title : data.title,
    })
    var body ={
      "status": false,
      "text": this.todoForm.value.text,
      "title": this.todoForm.value.title
    }
    this.api.editTodo(data.id,body).subscribe(res => {
      if(res){
        this.showSpinner = true;
        this.transtimer = setTimeout(() => { 
          this.toastr.warning('Marked As In-Complete')
          this.getData();
          this.showSpinner = false;
         }, 500);
         this.todoForm.reset();
      }
  
    })
}

filterData(data: any, index: any = 1){
  let all = []
  if(data === 'all'){
    this.selectedIndex = index;
    for(let a of this.todoDatas){
      all.push(a)
    }
  }
  if(data === 'pending'){
    this.selectedIndex = index;
    for(let a of this.todoDatas){
      if(a.status == false){
        all.push(a)
      }
    }
  }
  if(data === 'done'){
    this.selectedIndex = index;
    for(let a of this.todoDatas){
      if(a.status == true){
        all.push(a)
      }
    }
  }
  this.todoData = all;
}
}
