// Drag & Drop Interfaces
interface Draggable {
// We need a listener that listens to the start of the drag event and one that listens to the end of the drag event
// DragEvent is a built in type TypeScript Ships with
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void; 
}
interface DragTarget {
  // is the thing you are dragging something over a valid drag target
  // if you don't do the right thing in the dragOver handler, dropping will not be possible
  dragOverHandler(event: DragEvent): void
  // will handle the drop like updating the data in the UI
  dropHandler(event: DragEvent): void
  // if the person aborts the drag
  dragLeaveHandler(event: DragEvent): void
}


// Project Type
// We can use this enum instead of a Union Type
enum ProjectStatus { 
  Active, 
  Finished
}

// A way of building project objects which always have the same structure
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
// Who ever passes the listener expexts to get some items when the listener fires
// This might not be an array of projects so we can create a generic type
// type Listener = (items: Project[]) => void;
// When we extend state we have to specify which type of data this state will work with and inside of state this gets forwarded to our Listener custom type
type Listener<T> = (items: T[]) => void;

// You might have a bigger application with multiple states like userState, projects, shoppingCart
// Some features of the state class are always the same: array of private listeners and the addListener method
class State<T> {
  // change private to protected so that it can be used in the extended classes
 protected listeners: Listener<T>[] = []; // an array of functions
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
// In Project State we extend the state class and provide a value
class ProjectState extends State<Project> {
  // listeners will be called whenever a part of state changes
  //private listeners: Listener[] = []; // an array of functions
  private projects: Project[] = [];
  private static instance: ProjectState;

  // creating a private constructor here guarantees it will be a singleton class
  // We only want one state management object for this project
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  // add listener pushes a new function and when something changes in add project the listener is executed
  // addListener is now in the base class
  // addListener(listenerFn: Listener) {
  //   this.listeners.push(listenerFn);
  // }
  
  addProject(title: string, description: string, numOfPeople: number )  {
        const newProject = new Project(
          Math.random().toString(), 
          title, 
          description, 
          numOfPeople, 
          ProjectStatus.Active
        );
      
        // for (const listenerFn of this.listeners ) {
        //   // slice will only return a copy of the array and not the original array so that it can be edited from the place the the listener function is coming from
        //   // We do not want to pass the original reference but a copy of the array
        //   // https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
        //   listenerFn(this.projects.slice());
        //   // Every listener function is now getting executed and gets our brand new copy of our projects
        // }
        this.projects.push(newProject);
        this.updateListeners();
    }
  // move project from a list it's currently in to a new list 
    moveProject(projectId: string, newStatus: ProjectStatus) {
      // find a project with that ID in your array of projects (private projects: Project[] = [];)
      // find gives us access to evey element of the array
      const project = this.projects.find(prj => prj.id === projectId );
      // if project status is different from the new status, then we can re-render
      // So if you drop in the same box, it will not re-render
      if (project && project.status !== newStatus) {
          project.status = newStatus;
          this.updateListeners();
      }
    }
// Now all listeners will be triggered and the list will re-render its items
    private updateListeners() {
      for (const listenerFn of this.listeners ) {
        listenerFn(this.projects.slice());
    }
  }
}
// instantiating the class here makes it globally available
// We are guaranteed to work with only one object and it will be the same object for the entire application
// const projectState = new ProjectState();
const projectState = ProjectState.getInstance();


// Code goes here!
// Validation
// You can use a custom type to but if you are a bigger fan of defining an object, use interface
// you can use a question mark for undefined
// the ? makes these options optional
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  // this is true but will be set to false as soon as one of the checks fails
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  // This makes sure the conditional is run even if the value of the input is set to a falsy 0 value
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//autobind decorator
//methods are just properties that hold functions
//If you need to use bind multiple times you can create an autobind method.
// This form is coming from the
// We need the target, the method and the descriptor for the decorator
function autobind(
  _: any,
  // Since we are not using these parameters (replacing target: any and methodName: string)
  _2: string,
  descriptor: PropertyDescriptor
) {
  //store the method which you originally defined
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Create a base class to carry out the taks of listing and adding projects to the DOM
// create a generic class that when we inherit from it, we can set the concrete types
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  // abstract class can only be used as a base class. If you try to insantiate, typescript will thow an error
  templateElement: HTMLTemplateElement;
  // when we extend the Component class we can specify the concrete types
  hostElement: T;
  element: U;
  // hostElement: HTMLDivElement;
  // element: HTMLElement;
  
  constructor(
    templateId: string, 
    hostElementId: string, 
    insertAtStart: boolean,
    newElementId?: string
    ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    
    // this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    // this.element.id = `${this.type}-projects`;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element );
  }  
  // The complete implementation is missing but we force any class inheriting from component class to have these to two methods and to have them available
  // The component class does all the general rendering or the attachment of the component but the concrete content and configuration needs to happen in the place where you inherit
  abstract configure(): void;
  abstract renderContent(): void;
}


// ProjectItem Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
  private project: Project;
   // provide the ID of the element where the project should be rendered
// we access this like a property
  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else
      return `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
   // Template Id and then hostId
    super('single-project', hostId, false, project.id);
    this.project = project
    this.configure();
    this.renderContent();
  }

 @autobind 
  dragStartHandler(event: DragEvent) {
    // console.log(event);
    // You can attach data to the drag event and that data can be extract upon a drop
    // the browser will store that data and ensure the data is the same as what you drag
    // Attaching to an id (not the object itself) so we can use later in state
    event.dataTransfer!.setData('text/plain', this.project.id);
    // this tells TS our intention of what to do with the draggable thing
    event.dataTransfer!.effectAllowed = 'move';
  }
  // dragEndHandler(event: DragEvent) {
  dragEndHandler(_: DragEvent) {
    console.log('DragEnd');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  // these are all fields
  // we keep the assignedProjects because that is specific to the ProjectList class 
    assignedProjects: Project[];
// Literal Union Type active or finished
    constructor(private type: "active" | "finished") {
      // false, not inserted at the start but at the end
      super('project-list', 'app', false, `${type}-projects`);
      this.assignedProjects = []; 

      // this.attach()   
      this.configure();
      this.renderContent();
      }
      @autobind
      dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
          // The default behavior of the browser is to prevent drop and drag events
          event.preventDefault();
          const listEl = this.element.querySelector('ul')!;
          listEl.classList.add('droppable');
        }
      }
      @autobind
      dropHandler(event: DragEvent) {
        // This should be the project ID that we attach to our dataTransfer package on the project item
       const prjId = event.dataTransfer!.getData('text/plain');
       // moveProject   // find a project with that ID in your array of projects (private projects: Project[] = [];)
      // find gives us access to evey element of the array
       projectState.moveProject(
        prjId,
        // This ternary allows us to drag and drop between the ACTIVE PROJECTS and FINISHED PROJECTS
        this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
       )
      }
      @autobind
      dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
      }

      configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projects: Project[]) => {
          // The anonymous function will get a list of functions when it is called from inside project state 
          const relevantProjects = projects.filter(prj => {
            if (this.type === 'active') {
              return prj.status === ProjectStatus.Active;
            }
            return prj.status === ProjectStatus.Finished;
          });
          // this.assignedProjects = projects;
          this.assignedProjects = relevantProjects;
          this.renderProjects();
        });
      }

       renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id=listId;
        this.element.querySelector('h2')!.textContent = 
          this.type.toUpperCase() + ' PROJECTS';
      }

      private renderProjects() {
          const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
          // Get rid of all list items and then re-render
          // When we add a new project, we re-render all projects, which is fine for the purposes of our project
          listEl.innerHTML = '';
          for (const prjItem of this.assignedProjects) {
              // const listItem = document.createElement('li');
              // // Every project item will be a project object as we created up in the newProject state and therefore it will have a title
              // listItem.textContent = prjItem.title;
              // listEl.appendChild(listItem)
              // new ProjectItem(this.element.id, prjItem)
              new ProjectItem(this.element.querySelector('ul')!.id, prjItem)
          }
      }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // these are all fields
  // templateElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    //Remember that this.element refers to the form element
    //Now we have access to every object based on the class
    this.configure();
  }
  configure() {

    //the binding of this will refer to the class that the configure method was created in: ProjectInput
    //bind also makes it refer to the class inside of the submit handler as opposed to this.element / as opposed to the target of the event which in this case is the button
    //but why do we not use arrow methods? I must find out
    //this.element.addEventListener('submit', this.submitHandler.bind(this));
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {
    
  }
  //separating selection and rendering logic
  //returning tuple
  // TypeScript has special analysis around arrays which contain multiple types, and where the order in which they are indexed is important. These are called tuples.
  // use void to tell TypeScript that there is a possibility that the method will not return a value
  // below is a union type: You might return nothing or you might return a tuple
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true
    }
    const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
    }
    const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
    }
    // This makes sure that no input is empty
    if (
    //   validate({ value: enteredTitle, required: true, minLength: 5 }) &&
    //   validate({ value: enteredDescription, required: true, minLength: 5 }) &&
    //   validate({ value: enteredPeople, required: true, minLength: 5 })
      !validate(titleValidatable) ||
      !validate( descriptionValidatable ) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      //add the + in front of enteredPeople so that it is cast as a number
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }
  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    // console.log(this.titleInputElement);
    this.gatherUserInput();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      // console.log(title, desc, people);
      // We now need to push the new project to our ProjectList class
      projectState.addProject(title, desc, people)
      this.clearInput();
    }
    // this will be bound to the current target of the event
    console.log(this.titleInputElement.value);
  }

}
// When the ProjectInput class is substantiated it should render the form
// It is rendered with the OO TypeScript code
const projectInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
// projectInput.attach();
