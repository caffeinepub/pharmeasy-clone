module {
  public type Actor = {
    var nextProductId : Nat;
    var nextOrderId : Nat;
    var nextLabTestId : Nat;
    var nextBookingId : Nat;
    var nextHealthPackageId : Nat;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
