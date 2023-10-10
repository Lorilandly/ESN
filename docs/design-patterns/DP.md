### DP Specification and Rationale

Our design pattern of choice for iteration 2 is the adapter pattern.
We'd like to provide clients of our PerformanceTest database a simple, uniform interface
for saving data that doesn't rely on the particulars of the underlying database, in this case,
PostgreSQL.

In our implementation of the adapter pattern, the PerformanceTestModel class will play the
role of adapter, and the Postgres Client (in this case, a Postgres Pool object) will play
the role of adaptee. We didn't find it necessary to create an additional class for "Target",
but are open to the possibility of creating one if we believe multiple subclasses of the
adapter will become necessary.

-   [Diagram](https://viewer.diagrams.net/?page-id=AntsNvd8vDp8DYpDSpO6&highlight=0000ff&edit=_blank&layers=1&nav=1&page-id=AntsNvd8vDp8DYpDSpO6#G17hR_xSGP90rC-pllEnbJ8A7NLXeNjATB) (see Design Pattern Tab)
