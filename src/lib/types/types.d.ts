type PickNullable<T> = {
  [P in keyof T as null extends T[P] ? P : never]: T[P]
}

type PickNotNullable<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P]
}

type OptionalNullable<T> = T extends object ? {
  [K in keyof PickNullable<T>]?: OptionalNullable<Exclude<T[K], null>>
} & {
    [K in keyof PickNotNullable<T>]: OptionalNullable<T[K]>
  } : T;

type TNonceResponse = {
  nonce: string;
  userId: string;
}