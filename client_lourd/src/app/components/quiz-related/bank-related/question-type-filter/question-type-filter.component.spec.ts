import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { QuestionType } from '@app/interfaces/question-type';
import { QuestionTypeFilterComponent } from './question-type-filter.component';

describe('QuestionTypeFilterComponent', () => {
    let component: QuestionTypeFilterComponent;
    let fixture: ComponentFixture<QuestionTypeFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [QuestionTypeFilterComponent],
        });
        fixture = TestBed.createComponent(QuestionTypeFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit the selected question type when filterChanged is called', () => {
        const selectedType = QuestionType.QRL;
        const eventMock = { target: { value: selectedType } };
        const emitSpy = spyOn(component.filterQuestionTypeChange, 'emit');
        component.filterChanged(eventMock as unknown as Event);
        expect(emitSpy).toHaveBeenCalledWith(selectedType);
    });
});
