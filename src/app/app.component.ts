import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User, UserService } from './user.service';
import { Todo, TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Todo List';

  //Services
  userService = inject(UserService);
  todoService = inject(TodoService);

  //User Signals
  members = this.userService.members;

  //Todo Signals
  isLoading = this.todoService.isLoading;
  selectedMember = this.todoService.currentMember;
  todosForMember = this.todoService.filteredTodos;
  errorMessage = this.todoService.errorMessage;
  incompleteOnly = signal(false);

  //Actions
  onSelected(ele: EventTarget | null) {
    const id = parseInt((ele as HTMLSelectElement).value);
    console.log('id :>> ', id);
    this.todoService.setMemberId(id);
  }

  onFilter(ele: EventTarget | null) {
    const filter = (ele as HTMLInputElement).checked;
    this.todoService.setIncompleteOnly(filter);
  }

  onChangeStatus(task: Todo, ele: EventTarget | null) {
    console.log('task.completed :>> ', task.completed);
    // const checked = (ele as HTMLInputElement).checked;
    this.todoService.changeStatus(task, !task.completed);
    this.todoService
      .saveChanges(task)
      .subscribe((response) => console.log('save changes: >> ', response));
  }
}
