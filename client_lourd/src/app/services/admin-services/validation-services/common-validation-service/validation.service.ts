import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    isStringEmpty(stringToCheck: string | undefined): boolean {
        return stringToCheck ? stringToCheck.trim().length === 0 : true;
    }

    isAttributeTypeOf(attributeValueToCheck: unknown, desiredType: string): boolean {
        return typeof attributeValueToCheck === desiredType;
    }

    isValidStringValue(attributeValueToCheck: unknown): boolean {
        return this.isAttributeTypeOf(attributeValueToCheck, 'string') && !this.isStringEmpty(attributeValueToCheck as string);
    }

    areTextsUnique(items: (QuestionChoice | Question)[] | undefined): boolean {
        if (items) {
            const uniqueTexts = new Set<string>();
            return items.every((item) => {
                const trimmedText = this.customTrim(item.text);
                if (uniqueTexts.has(trimmedText)) {
                    return false;
                }
                if (trimmedText) uniqueTexts.add(trimmedText);
                return true;
            });
        }
        return true;
    }

    normalizeTitle(title: string): string {
        return title
            .split(' ')
            .filter((s) => s)
            .join(' ')
            .toLowerCase();
    }

    private customTrim(toTrim: unknown) {
        if (this.isAttributeTypeOf(toTrim, 'string')) return (toTrim as string).trim();
        else return '';
    }
}
