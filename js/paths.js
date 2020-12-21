const visited = [];
const path = [];

function graph(v) {
  this.v = v;
  this.adjList = new Array(v);
  for (let i = 0; i < this.adjList.length; i++)
    this.adjList[i] = [];
  console.log(this.adjList);


  this.addEdge = function (a, b) {
    this.adjList[a].push(b);
  }

  this.combineIntegers = function (num1, num2) {
    return parseInt(num1.toString() + num2.toString());
  }

  this.printAllPaths = function (s, d, p) {
    const val = this.combineIntegers(p, s);
    visited.push(val);
    path.push(s);
    if (s === d) {
      for (let i = 0; i < path.length; i++)
        console.log(path[i]);
      console.log("----------------");

    } else {
      for (let i = 0; i < this.adjList[s].length; i++) {
        if (this.adjList[s][i] !== p && visited.indexOf(this.combineIntegers(s, this.adjList[s][i])) < 0)
          this.printAllPaths(this.adjList[s][i], d, s);
      }
    }
    path.pop();
    visited.splice(visited.indexOf(val), 1);
  }
}

const s = 0, d = 3;

const g = new graph(5);
g.addEdge(0, 1);
g.addEdge(0, 4);

g.addEdge(1, 2);
g.addEdge(1, 0);

g.addEdge(2, 3);
g.addEdge(2, 1);

g.addEdge(3, 2);
g.addEdge(3, 4);

g.addEdge(4, 3);
g.addEdge(4, 0);


g.printAllPaths(s, d, 9);

