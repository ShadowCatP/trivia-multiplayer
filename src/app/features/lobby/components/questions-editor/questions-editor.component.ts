import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Check, LucideAngularModule, Trash2 } from 'lucide-angular';
import { QuestionType, ValidQuestion } from '../../types/Question';

@Component({
  selector: 'app-questions-editor',
  imports: [ReactiveFormsModule, LucideAngularModule, CommonModule],
  templateUrl: './questions-editor.component.html',
  styleUrl: './questions-editor.component.css',
})
export class QuestionsEditorComponent implements OnInit {
  readonly Check = Check;
  readonly Trash2 = Trash2;

  @Output() back = new EventEmitter<ValidQuestion[]>();
  @Output() next = new EventEmitter<ValidQuestion[]>();

  @Input() initialValues: ValidQuestion[] = [];

  showQuestionsTypeModel = false;

  fb = inject(FormBuilder);
  questionForm!: FormGroup;

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      questions: this.fb.array([]),
    });

    const initialQuestions = this.initialValues.length
      ? this.initialValues
      : [this.createQuestion('multiple-choice').value];

    initialQuestions.forEach((q) => {
      this.questions.push(
        this.fb.group({
          id: [q.id || crypto.randomUUID()],
          type: [q.type],
          question: [q.question, Validators.required],
          answers: this.fb.array(
            q.answers.map((a: any) => this.fb.control(a, Validators.required)),
          ),
          correctAnswer: [q.correctAnswer],
        }),
      );
    });
  }

  get questions(): FormArray {
    return this.questionForm.get('questions') as FormArray;
  }

  getAnswers(question: AbstractControl): FormArray<FormControl> {
    return question.get('answers') as FormArray<FormControl>;
  }

  createQuestion(type: QuestionType): FormGroup {
    const answers =
      type === 'multiple-choice'
        ? this.fb.array(
            ['', '', '', ''].map((a) =>
              this.fb.control(a, Validators.required),
            ),
          )
        : this.fb.array(
            ['True', 'False'].map((a) =>
              this.fb.control(a, Validators.required),
            ),
          );

    return this.fb.group({
      id: [crypto.randomUUID()],
      type: [type],
      question: ['', Validators.required],
      answers: answers,
      correctAnswer: [0],
    });
  }

  addQuestion(type: QuestionType) {
    this.questions.push(this.createQuestion(type));
    this.showQuestionsTypeModel = false;
  }

  removeQuestion(index: number) {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  onSubmit() {
    if (this.questionForm.valid) {
      this.next.emit(this.questionForm.value.questions as ValidQuestion[]);
    }
  }
}
