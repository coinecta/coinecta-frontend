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
  recipientAddress: string | null;
  restrictedCountries: string[];
  saleTerms: string | null;
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

interface IOnChainAmount {
  unit: string;
  quantity: string;
}

interface IOnChainUtxo {
  address: string;
  tx_hash: string;
  tx_index: number;
  output_index: number;
  amount: IOnChainAmount[];
  block: string;
  data_hash: string | null;
  inline_datum: string | null;
  reference_script_hash: string | null;
}

interface BlockDetails {
  time: number;
  height: number;
  hash: string;
  slot: number;
  epoch: number;
  epoch_slot: number;
  slot_leader: string;
  size: number;
  tx_count: number;
  output: string;
  fees: string;
  block_vrf: string;
  op_cert: string;
  op_cert_counter: string;
  previous_block: string;
  next_block: string;
  confirmations: number;
}

interface IOnChainAmount {
  unit: string;
  quantity: string;
}


interface IOnChainInput {
  address: string;
  amount: IOnChainAmount[];
  tx_hash: string;
  output_index: number;
  data_hash: string | null;
  inline_datum: string | null;
  reference_script_hash: string | null;
  collateral: boolean;
  reference: boolean;
}

interface IOnChainOutput {
  address: string;
  amount: IOnChainAmount[];
  output_index: number;
  data_hash: string | null;
  inline_datum: string | null;
  collateral: boolean;
  reference_script_hash: string | null;
  reference: boolean;
}

interface ITransactionDetails {
  [key: string]: string | number | boolean | Date | ITransactionDetails | ITransactionDetails[] | null;
  hash: string;
  inputs: IOnChainInput[];
  outputs: IOnChainOutput[];
}

interface CombinedTransactionInfo {
  address: string;
  amountAda: number;
  time?: number;
  dbId?: string;
  txId?: string;
  userPoolWeight?: number;
}

interface Country {
  label: string;
  code: string;
}

interface ISalesTerm {
  header: string;
  bodyText: string;
}