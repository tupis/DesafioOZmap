export class ResponseDto<T = unknown> {
  public status: number;
  public data: T;

  constructor({ status, data }: { status: number; data: T }) {
    this.status = status;
    this.data = data;
  }
}
