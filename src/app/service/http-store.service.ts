import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';

export interface IdentifiableEntity {
  id: number | string;
}

export abstract class HttpStoreService<T extends IdentifiableEntity> {

  /**
   * Our store object, here we store all our fetched entities
   * So we can access them from all parts of our application and have a single source of truth
   */
  readonly entities$: Observable<T[]>;

  /**
   * The reference to the entity subject, through which the entities can be updated.
   * This way we don't expose our `BehaviorSubject` functions to the outside world
   * and limit managing the {@link entities$} to this service only.
   */
  private readonly entityRef: BehaviorSubject<T[]>;

  protected constructor(protected http: HttpClient) {
    this.entityRef = new BehaviorSubject([]);
    this.entities$ = this.entityRef.asObservable();
  }

  /**
   * Replaces the cache with the new entities
   * @param replacements - The entities that should be used to replace the current cache
   */
  replaceCache(replacements: T[]): void {
    this.entityRef.next(replacements);
  }

  /**
   * Sends a request to fetch all entities
   * @returns An observable that resolves when the request is done
   */
  getAll(url: string): Observable<void> {
    const request = this.http.get<T[]>(url)
      .pipe(
        map<T[], void>((entities: T[]) => this.replaceCache(entities)), // Replace the cache with the new entities
        shareReplay(1), // We only want to do the request once if the component decides to subscribe on the request
      );

    request.subscribe({
      error: (err) => console.error(err)
    });

    return request;
  }

}