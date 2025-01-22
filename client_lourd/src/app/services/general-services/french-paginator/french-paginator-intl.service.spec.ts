import { TestBed } from '@angular/core/testing';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { FrenchPaginatorIntlService } from './french-paginator-intl.service';

describe('FrenchPaginatorIntlService', () => {
    let service: FrenchPaginatorIntlService;
    const PAGE_SIZE = 10;
    const ONE_ITEM = 1;
    const FIVE_ITEMS = 5;
    const NINETY_FIVE_ITEMS = 95;
    const ONE_HUNDRED_ITEMS = 100;
    const ONE_HUNDRED_TEN_ITEMS = 110;
    const LAST_PAGE_INDEX = 9;
    const PAGE_INDEX_BEYOND_LENGTH = 10;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatPaginatorIntl, useClass: FrenchPaginatorIntlService }],
        });
        service = TestBed.inject(MatPaginatorIntl) as FrenchPaginatorIntlService;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have French labels', () => {
        expect(service.itemsPerPageLabel).toBe('Éléments par page:');
        expect(service.nextPageLabel).toBe('Page suivante');
        expect(service.previousPageLabel).toBe('Page précédente');
        expect(service.firstPageLabel).toBe('Première page');
        expect(service.lastPageLabel).toBe('Dernière page');
    });

    it('should have French labels', () => {
        expect(service.itemsPerPageLabel).toBe('Éléments par page:');
        expect(service.nextPageLabel).toBe('Page suivante');
        expect(service.previousPageLabel).toBe('Page précédente');
        expect(service.firstPageLabel).toBe('Première page');
        expect(service.lastPageLabel).toBe('Dernière page');
    });

    it('should provide correct range label', () => {
        expect(service.getRangeLabel(0, PAGE_SIZE, FIVE_ITEMS)).toBe('1 – 5 sur 5');
    });

    it('should provide "0 sur 0" when length is 0', () => {
        expect(service.getRangeLabel(1, PAGE_SIZE, 0)).toBe('0 sur 0');
    });

    it('should provide the correct range label when the startIndex is 0', () => {
        expect(service.getRangeLabel(0, PAGE_SIZE, ONE_HUNDRED_ITEMS)).toBe('1 – 10 sur 100');
    });

    it('should provide the correct range label for the last page when not full', () => {
        expect(service.getRangeLabel(LAST_PAGE_INDEX, PAGE_SIZE, NINETY_FIVE_ITEMS)).toBe('91 – 95 sur 95');
    });

    it('should provide the correct range label for a single item', () => {
        expect(service.getRangeLabel(0, ONE_ITEM, ONE_ITEM)).toBe('1 – 1 sur 1');
    });

    it('should provide the correct range label for an empty page in a non-empty dataset', () => {
        expect(service.getRangeLabel(PAGE_INDEX_BEYOND_LENGTH, PAGE_SIZE, NINETY_FIVE_ITEMS)).toBe('101 – 95 sur 95');
    });

    it('should provide the correct range label when the last page is full', () => {
        expect(service.getRangeLabel(PAGE_INDEX_BEYOND_LENGTH, PAGE_SIZE, ONE_HUNDRED_TEN_ITEMS)).toBe('101 – 110 sur 110');
    });
});
