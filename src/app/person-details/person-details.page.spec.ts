import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonDetailsPage } from './person-details.page';

describe('PersonDetailsPage', () => {
  let component: PersonDetailsPage;
  let fixture: ComponentFixture<PersonDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
