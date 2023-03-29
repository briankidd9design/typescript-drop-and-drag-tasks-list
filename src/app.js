var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function validate(validatableInput) {
    // this is true but will be set to false as soon as one of the checks fails
    var isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    // This makes sure the conditional is run even if the value of the input is set to a falsy 0 value
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
//autobind decorator
//methods are just properties that hold functions
//If you need to use bind multiple times you can create an autobind method.
// This form is coming from the
// We need the target, the method and the descriptor for the decorator
function autobind(_, 
// Since we are not using these parameters (replacing target: any and methodName: string)
_2, descriptor) {
    //store the method which you originally defined
    var originalMethod = descriptor.value;
    var adjDescriptor = {
        configurable: true,
        get: function () {
            var boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        //remember that <> cannot be used in react for coercing the type. So I am going to use as
        //<HTMLTemplateElement>...document.getElementById(...)...
        // ! means that this value will never be null. If you are ever not sure of this you can use a conditional to check if the value is null or not
        this.templateElement = document.getElementById("project-input");
        //this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        // this.hostElement = <HTMLDivElement>document.getElementById('app')!;
        // Host
        // Host element holds a reference to the element where we want to render the template content in the end
        // templateElement gives us access to the element that holds this content
        this.hostElement = document.getElementById("app");
        //. content gives a reference to the content on the template
        //the argument provides all levels of nesting with a deep clone
        // With template node you pass a pointer at your template element, which is this.templateElement
        // .content gives a reference to the content of the template
        // true means that this is a deep clone so all levels of nesting
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        // This is adding an id for the css to style the element
        this.element.id = "user-input";
        //Remember that this.element refers to the form element
        //Now we have access to every object based on the class
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
    //separating selection and rendering logic
    //returning tuple
    // TypeScript has special analysis around arrays which contain multiple types, and where the order in which they are indexed is important. These are called tuples.
    // use void to tell TypeScript that there is a possibility that the method will not return a value
    // below is a union type: You might return nothing or you might return a tuple
    ProjectInput.prototype.gatherUserInput = function () {
        var enteredTitle = this.titleInputElement.value;
        var enteredDescription = this.descriptionInputElement.value;
        var enteredPeople = this.peopleInputElement.value;
        var titleValidatable = {
            value: enteredTitle,
            required: true
        };
        var descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        var peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };
        // This makes sure that no input is empty
        if (
        //   validate({ value: enteredTitle, required: true, minLength: 5 }) &&
        //   validate({ value: enteredDescription, required: true, minLength: 5 }) &&
        //   validate({ value: enteredPeople, required: true, minLength: 5 })
        !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Invalid input, please try again");
            return;
        }
        else {
            //add the + in front of enteredPeople so that it is cast as a number
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    };
    ProjectInput.prototype.clearInput = function () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    };
    ProjectInput.prototype.submitHandler = function (event) {
        event.preventDefault();
        // console.log(this.titleInputElement);
        this.gatherUserInput();
        var userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            var title = userInput[0], desc = userInput[1], people = userInput[2];
            console.log(title, desc, people);
            this.clearInput();
        }
        // this will be bound to the current target of the event
        console.log(this.titleInputElement.value);
    };
    ProjectInput.prototype.configure = function () {
        //the binding of this will refer to the class that the configure method was created in: ProjectInput
        //bind also makes it refer to the class inside of the submit handler as opposed to this.element / as opposed to the target of the event which in this case is the button
        //but why do we not use arrow methods? I must find out
        //this.element.addEventListener('submit', this.submitHandler.bind(this));
        this.element.addEventListener("submit", this.submitHandler);
    };
    // this is essentially like appending to the DOM
    // inserts an element into a specified position
    // https://www.w3schools.com/jsref/met_node_insertadjacentelement.asp
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    };
    __decorate([
        autobind
    ], ProjectInput.prototype, "submitHandler");
    return ProjectInput;
}());
// When the ProjectInput class is substantiated it should render the form
// It is rendered with the OO TypeScript code
var projectInput = new ProjectInput();
// projectInput.attach();
