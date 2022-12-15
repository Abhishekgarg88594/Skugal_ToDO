import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Home } from './module/home';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = "https://angular-skugal-default-rtdb.firebaseio.com/data.json"

  constructor(
    private http : HttpClient,
  ) { }

  getData(){
    return this.http.get<{ [id: string] : Home }>(this.url)
    .pipe(
      map((posts) => {
        let postData : Home[] = [];
        for (let id in posts){
          postData.push({ ...posts[id], id})
        }
        return postData
      })
    )
  }

  postData(body: any){
    return this.http.post(this.url,body)
  }

  deleteData(id : any){
    return this.http.delete(`https://angular-skugal-default-rtdb.firebaseio.com/data/${id}.json`)
  }
  editTodo(id:any, body:any){
    return this.http.put(`https://angular-skugal-default-rtdb.firebaseio.com/data/${id}.json`, body)
  }
}
