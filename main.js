// helpers
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Game

class Game extends React.Component {
  constructor() {
    super();

    this.state = {
      action: "run",
      size: "70x50",
      speed: "fast",
      generation: 0
    }

    this.updateAction = this.updateAction.bind(this);
    this.updateSize = this.updateSize.bind(this);
    this.updateSpeed = this.updateSpeed.bind(this);
    this.updateGeneration = this.updateGeneration.bind(this);
    this.resetGeneration = this.resetGeneration.bind(this);
  }

  updateAction(action) {
    this.setState({
      "action": action
    });
  }

  updateSize(size) {
    this.setState({
      "size": size,
      "action": "clear"
    });
  }

  updateSpeed(speed) {
    this.setState({
      "speed": speed
    });
  }

  updateGeneration() {
    this.setState({
      "generation": this.state.generation + 1
    });
  }

  resetGeneration() {
    this.setState({
      "generation": 0
    });
  }

  render() {
    return (<div>
              <Controls updateAction={this.updateAction} action={this.state.action} generation={this.state.generation} resetGeneration={this.resetGeneration}/>
              <Simulation size={this.state.size} speed={this.state.speed} action={this.state.action} updateGeneration={this.updateGeneration}/>
              <Settings speed={this.state.speed} size={this.state.size} updateSize={this.updateSize} updateSpeed={this.updateSpeed} resetGeneration={this.resetGeneration}/>
          </div>);
  }
}

class Controls extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.generation != nextProps.generation || this.props.action != nextProps.action;
  }

  render() {
    return (<div className="row">
              <div className="col-sm-2 col-md-2"></div>
              <div className="col-sm-8 col-md-8 wrapper controls-wrapper">
                <div className="row">
                  <div id="controls" className="col-sm-7 col-md-7 text-center">
                    <ControlButton value="run" updateAction={this.props.updateAction} active={this.props.action == "run"}/>
                    <ControlButton value="pause" updateAction={this.props.updateAction} active={this.props.action == "pause"}/>
                    <ControlButton value="clear" updateAction={this.props.updateAction} resetGeneration={this.props.resetGeneration} active={this.props.action == "clear"}/>
                  </div>
                  <div id="generation-counter" className="col-sm-5 col-md-5 text-center">
                    Generation: {this.props.generation}
                  </div>
                </div>
              </div>      
              <div className="col-sm-2 col-md-2"></div>
           </div>);
  }
}

class Simulation extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        data: this.getRandomData(), //0-dead, 1-live new, 2 - live old
        interval: undefined
      }

      this.update = false;
      this.updateCell = undefined;

      this.getSizeName = this.getSizeName.bind(this);
      this.getRowsNumber = this.getRowsNumber.bind(this);
      this.getColsNumber = this.getColsNumber.bind(this);
      this.speedToMilliseconds = this.speedToMilliseconds.bind(this);
      this.getRandomData = this.getRandomData.bind(this);
      this.areAllDead = this.areAllDead.bind(this);
      this.getNewValue = this.getNewValue.bind(this);
      this.countLiveNeighbours = this.countLiveNeighbours.bind(this);
      this.animateCell = this.animateCell.bind(this);
      this.updateData = this.updateData.bind(this);
      this.clearData = this.clearData.bind(this);
    }

    shouldComponentUpdate() {
      return this.update || this.updateCell !== undefined;
    }

    componentWillUpdate() {
      this.update = false;
      this.updateCell = undefined;
    }

    componentDidMount() {
      if (this.state.interval === undefined) {
        this.setState({
          "interval": setInterval(this.updateData, this.speedToMilliseconds(this.props.speed))
        });
      }
    }

    componentWillUnmount() {
      clearInterval(this.state.interval);
    }

    getSizeName(size) {
      switch (size.split("x")[0]) {
        case "50":
          return "small";
          break;
        case "70":
          return "medium";
          break;
        case "100":
          return "large";
          break;
        default:
          return "medium";
      }
    }

    getRowsNumber() {
      return this.props.size.split("x")[1];
    }

    getColsNumber() {
      return this.props.size.split("x")[0];
    }

    speedToMilliseconds(speed) {
        switch (speed) {
          case "fast":
          return 300;
          break;
        case "medium":
          return 800;
          break;
        case "slow":
          return 2000;
          break;
        default:
          return 800;
      }    
  }
  
  getRandomData(){
    var data = [];
    for(var i=0; i<this.getRowsNumber(); i++){
      var row = [];
      for(var j=0; j<this.getColsNumber(); j++){
        var random = Math.floor(Math.random() * 2) + 1;
        row.push(random%2);
      }
      data.push(row);
    }
    return data;
  }
  
  areAllDead(){
    for(var i=0; i<this.getRowsNumber(); i++){
      for(var j=0; j<this.getColsNumber(); j++){
        if(this.state.data[i][j] > 0){
          return false;
        }
      }
    }
    return true;
  }
  
  getNewValue(row, col){ 
    var liveNeighbours = this.countLiveNeighbours(row, col);
    if(this.state.data[row][col] > 0){
      if(liveNeighbours == 2 || liveNeighbours == 3){
        return 2;
      } 
    } else {
      if(liveNeighbours == 3){
        return 1;
      } 
    }
    return 0;
  }
  
  countLiveNeighbours(row, col){   
    var counter = 0;
    if(row != 0){
      if(col != 0){
        counter += this.state.data[row-1][col-1] > 0;
      }
      counter += this.state.data[row-1][col] > 0;
      if(col != this.getColsNumber()){
        counter += this.state.data[row-1][col+1] > 0;
      }
    }
    
    if(col != 0){
        counter += this.state.data[row][col-1] > 0;
    }
    if(col != this.getColsNumber()){
        counter += this.state.data[row][col+1] > 0;
    }
    
    if(row != this.getRowsNumber()-1){
      if(col != 0){
        counter += this.state.data[row+1][col-1] > 0;
      }
      counter += this.state.data[row+1][col] > 0;
      if(col != this.getColsNumber()){
        counter += this.state.data[row+1][col+1] > 0;
      }
    }
    return counter;
  }
  
  animateCell(row, col){
    var data = this.state.data;  
    data[row][col] = (data[row][col] == 0 ? 1 : 0);
    this.updateCell = {"row" : row, "col" : col};
    this.setState({"data" : data});
  }
  
  updateData(){
    var dataOld = this.state.data;
    var dataNew = [];
    if(!this.areAllDead()){
     // var timeBefore = performance.now();
      for(var i=0; i<this.getRowsNumber(); i++){
          var row = [];
          for(var j=0; j<this.getColsNumber(); j++){
            var newValue = this.getNewValue(i, j);
            row.push(newValue);
          }
          dataNew.push(row);
      }
     // var time = performance.now() - timeBefore;
     // console.log("Time performing = " + time);
      this.update = true;
      this.setState({"data" : dataNew});
    
     // var time = performance.now() - timeBefore;
     // console.log("Time performing = " + time);
      this.props.updateGeneration();
     // var time = performance.now() - timeBefore;
     // console.log("Time performing = " + time);
    }  
  }
  
  clearData(newSize){
    var data = [];
    for(var i=0; i<newSize.split("x")[1]; i++){
      var row = [];
      for(var j=0; j<newSize.split("x")[0]; j++){
        row.push(0);
      }
      data.push(row);
    }
    this.update = true;
    this.setState({"data" : data});
  }
  
  componentWillReceiveProps(nextProps){
    if(nextProps.action == "run"){
      if(this.state.interval === undefined) {
        this.setState({"interval" : setInterval(this.updateData, this.speedToMilliseconds(this.props.speed))});
      }     
    }
    if(nextProps.action == "pause"){
      clearInterval(this.state.interval);
      this.setState({"interval" : undefined});
    }
    if(nextProps.action == "clear"){
      clearInterval(this.state.interval);
      this.setState({"interval" : undefined});
      var newSize = nextProps.size;
      this.clearData(newSize);
    }
    if(nextProps.speed != this.props.speed){
      clearInterval(this.state.interval);
      this.setState({"interval" : setInterval(this.updateData, this.speedToMilliseconds(nextProps.speed))});
    }
  }
  
  render(){
    var trs = [];
    var doNotUpdate = false;
    for(var i=0; i<this.props.size.split("x")[1]; i++){
        if(this.updateCell !== undefined && this.updateCell.row == i){
          doNotUpdate = true;
        }
        trs.push(<Row key={i} index={i} size={this.props.size} data={this.state.data[i]} animateCell={this.animateCell} doNotUpdate={doNotUpdate}/>);
    }
    return (<div id="simulation" className={"text-center wrapper " + this.getSizeName(this.props.size)}>
                <table><tbody>{trs}</tbody></table>
             </div>);
  } 
} 

class Row extends React.Component {
  constructor(props) {
      super(props);
  }
  
  shouldComponentUpdate(nextProps, nextState){
     return !nextProps.doNotUpdate;
  }
  
  render(){
    var tds=[];
    for(var i=0; i<this.props.size.split("x")[0]; i++){
      tds.push(<Cell key={i} row={this.props.index} col={i} live={this.props.data[i]} animateCell={this.props.animateCell}/>);
    }
    return (<tr>{tds}</tr>)
  }
}

class Cell extends React.Component {
  constructor(props) {
      super(props);
    
      this.handleClick = this.handleClick.bind(this);
  }
  
  shouldComponentUpdate(nextProps, nextState){
    return this.props.live != nextProps.live;
  }
  
  getClassNames(){
    var names = ""
    if(this.props.live > 0){
      names += "live";
    }
    if(this.props.live > 1){
      names += " old"
    }
    return names;
  }
  
  handleClick(event){
    this.props.animateCell(this.props.row, this.props.col);
  }
  
  render(){
    return(<td className={"cell row-"+this.props.row+" col-"+this.props.col + " " + this.getClassNames()} onClick={this.handleClick}></td>);
  }
}

class Settings extends React.Component {
  constructor(props) {
      super(props);
  }
  
  render(){
    return (<div className="row">
              <div className="col-sm-2 col-md-2"></div>
              <div id="settings" className="col-sm-8 col-md-8 wrapper settings-wrapper">
                <div className="row">
                  <div className="col-sm-3 col-md-3 text-center">Board Size:</div>
                  <SettingsButton settingKey="size" value="50x30" active={this.props.size == "50x30"} updateSize={this.props.updateSize} resetGeneration={this.props.resetGeneration}/>
                  <SettingsButton settingKey="size" value="70x50" active={this.props.size == "70x50"} updateSize={this.props.updateSize} resetGeneration={this.props.resetGeneration}/>
                  <SettingsButton settingKey="size" value="100x80" active={this.props.size == "100x80"} updateSize={this.props.updateSize} resetGeneration={this.props.resetGeneration}/>
                </div>
                <div className="row">
                  <div className="col-sm-3 col-md-3 text-center">Sim Speed:</div>
                  <SettingsButton settingKey="speed" value="slow" active={this.props.speed == "slow"} updateSpeed={this.props.updateSpeed}/>
                  <SettingsButton settingKey="speed" value="medium" active={this.props.speed == "medium"} updateSpeed={this.props.updateSpeed}/>
                  <SettingsButton settingKey="speed" value="fast" active={this.props.speed == "fast"} updateSpeed={this.props.updateSpeed}/>
                </div>
              </div>      
              <div className="col-sm-2 col-md-2"></div>
          </div>);
  } 
} 

class ControlButton extends React.Component {
  constructor(props) {
      super(props);
    
      this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(){
    this.props.updateAction(this.props.value);
    if(this.props.value == "clear"){
      this.props.resetGeneration();
    }
  }
  
  render(){
    return (<div className="col-sm-4 col-md-4 text-center">
             <button type="button" onClick={this.handleClick} className={"btn btn-sm " + (this.props.active ? "active" : "")}>{capitalizeFirst(this.props.value)}</button>
          </div>);
  } 
} 

class SettingsButton extends React.Component {
  constructor(props) {
      super(props);
    
      this.handleClick = this.handleClick.bind(this);
  }
  
   handleClick(){
    if(this.props.settingKey == "size"){
      this.props.updateSize(this.props.value);     
      this.props.resetGeneration();
    }
    if(this.props.settingKey == "speed"){
      this.props.updateSpeed(this.props.value);
    }      
  }
  
  render(){
    return (<div className="col-sm-3 col-md-3 text-center">
             <button type="button" onClick={this.handleClick} className={"btn btn-sm " + (this.props.active ? "active" : "")}>{capitalizeFirst(this.props.value)}</button>
          </div>);
  } 
} 

ReactDOM.render(<Game />,  document.getElementById('game'));