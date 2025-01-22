/* eslint-disable @typescript-eslint/no-explicit-any */ // spy sur methode privee
import { TestBed } from '@angular/core/testing';
import * as MockValidationConstants from '@app/constants/mock-validation-constants';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isStringEmpty method should return true if string is only whitespace', () => {
        const result = service.isStringEmpty('   ');
        expect(result).toBeTrue();
    });

    it('isStringEmpty method should consider undefined as empty', () => {
        const result = service.isStringEmpty(undefined);
        expect(result).toBeTrue();
    });

    it('isStringEmpty method should return false if string is not empty', () => {
        const result = service.isStringEmpty('Blabla');
        expect(result).toBeFalse();
    });

    it('isAttributeTypeOf method should return true if attribute is of desiredType', () => {
        const result = service.isAttributeTypeOf(MockValidationConstants.MOCK_NUMBER, 'number');
        expect(result).toBeTrue();
    });

    it('isAttributeTypeOf method should return false if attribute is not of desiredType', () => {
        const result = service.isAttributeTypeOf(' ', 'number');
        expect(result).toBeFalse();
    });

    it('isValidStringValue method should call isAttributeTypeOf and isStringEmpty methods', () => {
        const mockValue = 'Bubba';
        spyOn(service, 'isAttributeTypeOf').and.callFake(() => true);
        spyOn(service, 'isStringEmpty').and.callFake(() => true);
        service.isValidStringValue(mockValue);
        expect(service.isAttributeTypeOf).toHaveBeenCalledWith(mockValue, 'string');
        expect(service.isStringEmpty).toHaveBeenCalledWith(mockValue);
    });

    it('ValidStringValue should return true if isAttributeTypeOf returns true and isStringEmpty returns false', () => {
        spyOn(service, 'isAttributeTypeOf').and.callFake(() => true);
        spyOn(service, 'isStringEmpty').and.callFake(() => false);
        expect(service.isValidStringValue('a')).toBeTrue();
    });

    it('areTextsUnique should return true if questionChoices.text are unique and false otherwise', () => {
        expect(service.areTextsUnique(MockValidationConstants.MOCK_DUPLICATE_QUESTION_CHOICES)).toBeFalse();
        expect(service.areTextsUnique(MockValidationConstants.MOCK_UNIQUE_QUESTION_CHOICES)).toBeTrue();
    });

    it('areTextsUnique should ignore the questionChoices.text that are falsy (whitespace or empty string)', () => {
        expect(service.areTextsUnique(MockValidationConstants.MOCK_EMPTY_QUESTION_CHOICES)).toBeTrue();
    });

    it('areTextsUnique should return true if questionChoices is undefined', () => {
        expect(service.areTextsUnique(undefined)).toBeTrue();
    });

    it('areTextsUnique should return false if some questions are duplicated', () => {
        const duplicatedQuestions = JSON.parse(JSON.stringify(MockValidationConstants.MOCK_QUESTIONS_ARRAY));
        duplicatedQuestions[1].text = duplicatedQuestions[0].text;
        expect(service.areTextsUnique(duplicatedQuestions)).toBeFalse();
    });

    it('areTextUnique should return true if questions are not duplicated and should call customTrim', () => {
        spyOn<any>(service, 'customTrim');
        expect(service.areTextsUnique(MockValidationConstants.MOCK_QUESTIONS_ARRAY)).toBeTrue();
        expect(service['customTrim']).toHaveBeenCalledTimes(2);
    });

    it('customTrim should return trimmed string or empty string if input wasnt a string', () => {
        expect(service['customTrim'](3)).toBe('');
        expect(service['customTrim'](undefined)).toBe('');
        expect(service['customTrim'](' aloha   ')).toBe('aloha');
    });

    it('normalizeTitle should return proper "normalized" string', () => {
        const mockTitle = ' PhiLoSoPhIe         mODERNE';
        const normalizedTitle = 'philosophie moderne';
        expect(service['normalizeTitle'](mockTitle)).toEqual(normalizedTitle);
    });
});
