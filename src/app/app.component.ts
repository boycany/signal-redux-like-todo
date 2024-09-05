import { Component, inject, signal } from '@angular/core';
import { UserService } from './user.service';
import { Todo, TodoService } from './todo.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatSlideToggleModule,
  ],
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
  incompleteOnly = this.todoService.incompleteOnly;

  //Actions
  onSelected(id: number) {
    this.todoService.setMemberId(id);
  }

  onFilter(filter: boolean) {
    this.todoService.setIncompleteOnly(filter);
  }

  onChangeStatus(task: Todo, checked: boolean) {
    this.todoService.changeStatus(task, checked);
    this.todoService
      .saveChanges(task)
      .subscribe((response) => console.log('save changes: >> ', response));
  }
}
