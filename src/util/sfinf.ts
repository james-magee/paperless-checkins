// this actually could be a library
// we want to inter fields by spaces, so we can search easily
// the point isnt exactly fuzzy search because fuzzy search includes more results
// as the string increases ... it might jsut be fuzzy search...

import type { Game } from "./manager";

// it's basically like an extremely lightweight search engine
// what about an arbitrary number of types?
// one option would be a recursive type union

// example of nested generics..
type kT<T> = keyof T;
type SMap<T> = Partial<Record<kT<T>, (o: T, s: string) => boolean>>;

/**
 *
 * @param objects
 * @param fstrats
 * @param queryFieldsForceDelimit - the string which will always indicate that two fields are being searched for
 * @returns
 */
const staticFactory = <T extends object>(
  objects: Array<T>,
  fstrats: SMap<T>,
  queryFieldsForceDelimit: string = "  ",
): ((query: string) => Array<T>) => {
  // RNOTE: if objects length is less than 0, reutrn a function which always produced [];
  if (objects.length <= 0) return () => [];
  // NOTE: the type definition indicates that the array of objects must all have same type
  // analyze object fields
  const analysis = objects[0];
  const fields: kT<T>[] = Object.keys(analysis).map((k) => k as keyof T);

  // const fieldCharacteristics: Record<kT<T>, string> = {};
  // design filter strategies
  const filterStrategies = { ...fstrats };
  const guessTargetedField = (query: string): kT<T> => {
    if (query.length <= 0) return fields[0];
    return fields[0];
  };
  const search = (query: string): T[] => {
    // simply specifies a set of keys of T
    const remainingFields = new Set<kT<T>>(fields);
    const results = new Set<T>();
    const subqs = query.split(queryFieldsForceDelimit);
    // each q corresponds to a lookup along one of the subq; we iterate through each, and remove when we find
    // some kind of function that applies to a particular field
    // const filterStrategies: Record<kT<T>, () => void> = {};

    for (const subq of subqs) {
      const field: kT<T> = guessTargetedField(subq);
      const strat = filterStrategies[field]!;
      const subqResults = objects.filter((o: T) => strat(o, subq));

      // determine whether we want to break or not...
      // accept this as a parameter
      if (subq === subqs.at(-1) && subqResults.length <= 0) break;
      subqResults.forEach((o) => results.add(o));

      // generally, some way of searching through
      // determining if a match is sufficient to remove; if there is no match we stop
      // determining which of the fields to remove
      // 1) guess which field is being targetted by number/string/time/etc.
      // check each of the fields
    }
    return Array.from(results);
  };
  return search;
};

// also note:
// would it be easier to just use a fuzzy finder?

const startsWith = (o: Game, s: string) => o.away_team.name.startsWith(s);

const fstrats: SMap<Game> = {
  away_team: startsWith,
  home_team: startsWith,
  field_name: startsWith,
  play_time: startsWith,
  home_score: startsWith,
  away_score: startsWith,
  tier: startsWith,
  home_mvp: startsWith,
  away_mvp: startsWith,
};

const gameSearch = staticFactory<Game>([], fstrats);

gameSearch("83");
