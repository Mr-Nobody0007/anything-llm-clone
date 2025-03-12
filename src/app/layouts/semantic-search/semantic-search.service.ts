
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class SemanticSearchService {



constructor() { }

// Example method to post user query and retrieve the summary
getSummary(userQuery: string): Observable<any>{
  const mockResponse = {
    Summary: [
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id justo vel nulla fermentum convallis. Suspendisse potenti. Nulla facilisi. Integer lacinia ex vel urna ultrices, eu vulputate mi gravida. Morbi fringilla.",
        score: "7.665427"
      },
      {
        text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        score: "71.665427"
      },
      {
        text: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus.",
        score: "73.665427"
      }
    ]
  };

  return of(mockResponse);
}
}
