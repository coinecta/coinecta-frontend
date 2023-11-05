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

type TUserAddressQuery = {
  stake_address: string,
  active: boolean,
  active_epoch: number,
  controlled_amount: string,
  rewards_sum: string,
  withdrawals_sum: string,
  reserves_sum: string,
  treasury_sum: string,
  withdrawable_amount: string,
  pool_id: string
}