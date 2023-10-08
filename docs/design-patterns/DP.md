### DP Specification and Rationale

Our design pattern of choice for iteration 2 is the adapter pattern.
We'd like to decouple clients of our database from the particulars of its implementation.
For this reason, we're using an adapter (PerformanceTestModel) to provide a simpler and
more abstract interface to the operations of the PostgresSQL client.
