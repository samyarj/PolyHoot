import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-question-type-filter',
    templateUrl: './question-type-filter.component.html',
    styleUrls: ['./question-type-filter.component.scss'],
})
export class QuestionTypeFilterComponent {
    @Output() filterQuestionTypeChange = new EventEmitter<string>();

    filterChanged(event: Event): void {
        const selectedType = (event.target as HTMLSelectElement).value;
        this.filterQuestionTypeChange.emit(selectedType);
    }
}
