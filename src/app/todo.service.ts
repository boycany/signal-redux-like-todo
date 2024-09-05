import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { User, UserService } from './user.service';
import {
  catchError,
  delay,
  lastValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { updateProperty } from './utility/signalUpdate';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  todoUrl = 'https://jsonplaceholder.typicode.com/todos';

  //Services
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private state = signal<TodoState>({
    isLoading: false,
    currentMember: undefined,
    memberTodos: [],
    error: '',
    incompleteOnly: false,
  });

  isLoading = computed(() => this.state().isLoading);
  currentMember = computed(() => this.state().currentMember);
  errorMessage = computed(() => this.state().error);
  incompleteOnly = computed(() => this.state().incompleteOnly);
  private todos = computed(() => this.state().memberTodos);

  filteredTodos = computed(() =>
    this.incompleteOnly()
      ? this.todos().filter((t) => !t.completed)
      : this.todos(),
  );

  private selectedIdSubject = new Subject<number>();

  constructor() {
    // this.selectedIdSubject
    //   .pipe(
    //     tap(() => this.setLoadingIndicator(true)),
    //     tap((id) => this.setCurrentMember(id)),
    //     switchMap((id) => this.getTodos(id)),
    //     delay(1000), //Simulate network latency, for the purpose to see the loading indicator
    //     tap(() => this.setLoadingIndicator(false)),
    //     tap((todos) => this.setTodos(todos)),
    //     takeUntilDestroyed(),
    //   )
    //   .subscribe();

    /** Generic Solution with Subject */
    this.selectedIdSubject
      .pipe(
        tap(() => updateProperty(this.state, 'isLoading', true)),
        tap((id) =>
          updateProperty(
            this.state,
            'currentMember',
            this.userService.getCurrentMember(id),
          ),
        ),
        tap(() => updateProperty(this.state, 'memberTodos', [])),
        switchMap((id) => this.getTodos(id)),
        delay(1000),
        tap(() => updateProperty(this.state, 'isLoading', false)),
        tap((todos) => updateProperty(this.state, 'memberTodos', todos)),
        takeUntilDestroyed(),
      )
      .subscribe(() => console.log('tasks: ', this.state()));

    effect(() => {
      // console.log('this.filteredTodos() :>> ', this.filteredTodos());
    });
  }

  setMemberId(id: number) {
    this.selectedIdSubject.next(id);
  }

  /** Async/await Solution with lastValueFrom  */
  // async setMemberId(id: number) {
  //   updateProperty(this.state, 'isLoading', true);
  //   updateProperty(
  //     this.state,
  //     'currentMember',
  //     this.userService.getCurrentMember(id),
  //   );
  //   updateProperty(this.state, 'memberTodos', []);
  //   const todos = await lastValueFrom(this.getTodos(id));
  //   console.log('todos :>> ', todos);
  //   updateProperty(this.state, 'isLoading', false);
  //   updateProperty(this.state, 'memberTodos', todos);
  // }

  setIncompleteOnly(filter: boolean) {
    this.state.update((state) => ({ ...state, incompleteOnly: filter }));
  }

  changeStatus(task: Todo, status: boolean) {
    //Mark the task as completed
    const updatedTasks = this.todos().map((t) => {
      if (t.id === task.id) {
        return { ...t, completed: status };
      } else {
        return t;
      }
    });

    updateProperty(this.state, 'memberTodos', updatedTasks);
  }

  saveChanges(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.todoUrl}/${todo.id}`, todo).pipe(
      catchError((err) => {
        updateProperty(
          this.state,
          'error',
          err.message || err.statusText || 'Server error',
        );
        return of(todo);
      }),
    );
  }

  private setLoadingIndicator(isLoading: boolean) {
    this.state.update((state) => ({ ...state, isLoading }));
  }

  private setCurrentMember(id: number) {
    const currentMember = this.userService.getCurrentMember(id);
    this.state.update((state) => ({
      ...state,
      currentMember,
      memberTodos: [],
    }));
  }

  private getTodos(id: number) {
    return this.http.get<Todo[]>(`${this.todoUrl}?userId=${id}`).pipe(
      //Cut the length of the long string
      map((data) =>
        data.map((t) =>
          t.title.length > 80
            ? { ...t, title: t.title.substring(0, 80) + '...' }
            : t,
        ),
      ),
      catchError((err) => this.setError(err)),
    );
  }

  private setError(err: HttpErrorResponse): Observable<Todo[]> {
    this.state.update((state) => ({
      ...state,
      // error: setErrorMessage(err),
      error: err.message || err.statusText || 'Server error',
    }));
    return of([]);
  }

  private setTodos(todos: Todo[]) {
    this.state.update((state) => ({ ...state, memberTodos: todos }));
  }
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface TodoState {
  isLoading: boolean;
  currentMember: User | undefined;
  memberTodos: Todo[];
  error: string;
  incompleteOnly: boolean;
}
