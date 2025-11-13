export interface GenreSubType {
  id: string
  name: string
  typeId: string
}

export interface GenreType {
  id: string
  name: string
  familyId: string
  subGenres: GenreSubType[]
}

export interface GenreFamily {
  id: string
  name: string
  mainGenres: GenreType[]
}
