const TestSuite = require('parsegraph-testsuite').default;
alpha_Cluster_Tests = new TestSuite('alpha_Cluster');

alpha_Cluster_Tests.addTest('alpha_Cluster', function(resultDom) {
  const belt = new parsegraph_TimingBelt();
  const window = new parsegraph_Window();
  const widget = new alpha_GLWidget(belt, window);

  // test version 1.0
  const Cubeman = widget.BlockTypes.get('blank', 'Cubeman');

  const testCluster = new alpha_Cluster(widget);
  testCluster.addBlock(Cubeman, 0, 5, 0, 1);
  testCluster.calculateVertices();
});

