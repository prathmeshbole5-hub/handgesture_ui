/**
 * REACT QUICK REFERENCE GUIDE
 * Key patterns and concepts to understand
 */

// ============================================
// 1. IMPORT ESSENTIALS
// ============================================
// import { useState } from 'react';
// You need this to use hooks


// ============================================
// 2. BASIC COMPONENT STRUCTURE
// ============================================
/*
function MyComponent() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  );
}

export default MyComponent;
*/


// ============================================
// 3. PROPS (Parent → Child Communication)
// ============================================
/*
// Parent Component
function Parent() {
  return <Child name="Prathyush" age={25} />;
}

// Child Component receives props
function Child({ name, age }) {
  return <p>{name} is {age} years old</p>;
}
*/


// ============================================
// 4. STATE & useState HOOK
// ============================================
/*
const [count, setCount] = useState(0);

// count = current value
// setCount = function to update value
// 0 = initial value

<button onClick={() => setCount(count + 1)}>
  Count: {count}
</button>
*/


// ============================================
// 5. HANDLING EVENTS
// ============================================
/*
<button onClick={() => handleClick()}>Click me</button>
<input onChange={(e) => setText(e.target.value)} />
<form onSubmit={(e) => handleSubmit(e)}>...</form>

Common events:
- onClick
- onChange
- onSubmit
- onFocus
- onBlur
- onMouseEnter
- onMouseLeave
- onKeyDown
- onKeyUp
*/


// ============================================
// 6. CONDITIONAL RENDERING
// ============================================
/*
// Option 1: if/else before return
if (isLoggedIn) {
  return <h1>Welcome back!</h1>;
}
return <h1>Please login</h1>;

// Option 2: Ternary operator
{isLoggedIn ? <p>Hello</p> : <p>Login</p>}

// Option 3: Logical AND
{isLoggedIn && <p>You are logged in</p>}
*/


// ============================================
// 7. RENDERING LISTS (.map())
// ============================================
/*
const fruits = ['Apple', 'Banana', 'Orange'];

{fruits.map((fruit, index) => (
  <li key={index}>{fruit}</li>
))}

// Always use 'key' prop for list items!
// Use unique IDs, not index when possible
*/


// ============================================
// 8. FORM HANDLING
// ============================================
/*
const [email, setEmail] = useState('');

const handleSubmit = (e) => {
  e.preventDefault(); // Prevent page reload
  console.log(email);
};

<form onSubmit={handleSubmit}>
  <input
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <button type="submit">Submit</button>
</form>
*/


// ============================================
// 9. WORKING WITH OBJECTS IN STATE
// ============================================
/*
const [user, setUser] = useState({ name: 'John', age: 30 });

// Update user (spread operator)
setUser({
  ...user,
  age: 31
});

// Or:
setUser(prevUser => ({
  ...prevUser,
  age: prevUser.age + 1
}));
*/


// ============================================
// 10. WORKING WITH ARRAYS IN STATE
// ============================================
/*
const [items, setItems] = useState(['Apple', 'Banana']);

// Add item
setItems([...items, 'Orange']);

// Remove item
setItems(items.filter(item => item !== 'Banana'));

// Map (transform)
setItems(items.map(item => item.toUpperCase()));
*/


// ============================================
// 11. JSX RULES
// ============================================
/*
✅ DO:
- Use className (not class)
- Use camelCase for attributes (onClick, onChange)
- Return single root element
- Use fragments for multiple elements: <>...</>

❌ DON'T:
- Use 'class' instead of 'className'
- Use inline styles without objects: style={{ color: 'red' }}
- Return multiple elements without wrapper
*/


// ============================================
// 12. COMMON PATTERNS
// ============================================

// Pattern 1: Toggle
/*
const [isOpen, setIsOpen] = useState(false);
setIsOpen(!isOpen);
*/

// Pattern 2: Counter
/*
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prevCount => prevCount + 1); // Safer
*/

// Pattern 3: Input field
/*
const [text, setText] = useState('');
<input value={text} onChange={(e) => setText(e.target.value)} />
*/

// Pattern 4: Toggle checkbox
/*
const [checked, setChecked] = useState(false);
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
*/


// ============================================
// 13. TYPESCRIPT TIPS
// ============================================
/*
// Props with TypeScript
interface MyComponentProps {
  name: string;
  age: number;
  onClick?: () => void; // Optional prop
}

function MyComponent({ name, age }: MyComponentProps) {
  return <div>{name}: {age}</div>;
}

// State with TypeScript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
*/


// ============================================
// 14. DEBUGGING TIPS
// ============================================
/*
// Use console.log to see values
console.log('state value:', count);

// Use React DevTools browser extension
// Set breakpoints in VS Code
// Use debugger statement: debugger;

// Check if component is rendering too many times
console.log('Component rendered');
*/


// ============================================
// 15. COMPONENT COMPOSITION
// ============================================
/*
// Bad: One huge component
function App() {
  return <huge amount of JSX>;
}

// Good: Break into smaller components
function Header() {
  return <header>...</header>;
}

function Main() {
  return <main>...</main>;
}

function Footer() {
  return <footer>...</footer>;
}

function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
*/

export const QuickReference = null; // This is just documentation
