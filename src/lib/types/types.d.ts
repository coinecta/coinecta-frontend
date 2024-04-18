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

type TotalStakePerEpoch = {
  epoch: number;
  totalStake: number;
  totalDelegators: number;
  totalActivePools: number;
  totalStakePerPool: { [poolId: string]: number };
}

type TErgoBox = {
  boxId: string;
  value: string | bigint;
  assets: { tokenId: string; amount: string | bigint }[];
  ergoTree: string;
  creationHeight: number;
  additionalRegisters: NonMandatoryRegisters;
  index: number;
  transactionId: TransactionId;
};

type TProRataFormProps = {
  id: number;
  startDate: Date;
  endDate: Date;
  tokenTarget: number;
  tokenTicker: string;
  price: number;
  currency: string;
  deposited: number;
  name: string;
  projectName: string;
  projectIcon: string;
  projectSlug: string;
  whitelistSlug: string | null;
}

type TWalletListItem = {
  name: string;
  connectName: string;
  icon: string;
  iconDark: string;
  mobile: boolean;
  url: string;
}

interface IRedeemListItem {
  amount: string;
  currency: string;
}

interface IPoolWeightDataItem {
  address: string;
  uniqueNfts: number;
  totalStake: string;
  cummulativeWeight: number;
}

interface IPoolWeightAPI {
  data: IPoolWeightDataItem[];
  totalStakers: number;
  totalStake: string;
  totalCummulativeWeight: string;
}
