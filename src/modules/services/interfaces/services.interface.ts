export enum ServiceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export enum ServicesFilterFields {
  ID = "id",
  NAME = "name",
  OWNER = "owner",
  CREATEDAT = "createdAt"
}

export enum OrderType {
  ASC = "ASC",
  DESC = "DESC"
}

export interface ServicesFilter {
  orderBy: ServicesFilterFields;
  orderType: OrderType;
  searchKey: ServicesFilterFields;
  searchValue: string;
}