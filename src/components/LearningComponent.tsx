import { useState } from 'react';

/**
 * REACT BASICS - LEARNING COMPONENT
 * This component demonstrates key React concepts
 */

// ============================================
// 1. SIMPLE COMPONENT (No State)
// ============================================
// A component that just displays static content
function Welcome() {
  return (
    <div className="text-center p-6">
      <h1 className="text-3xl font-bold">Welcome to React! 👋</h1>
      <p className="text-gray-600 mt-2">This is a simple React component</p>
    </div>
  );
}

// ============================================
// 2. COMPONENT WITH PROPS
// ============================================
// Props allow you to pass data to components
interface UserCardProps {
  name: string;
  age: number;
  role: string;
}

function UserCard({ name, age, role }: UserCardProps) {
  return (
    <div className="p-4 border border-blue-400 rounded-lg bg-blue-50 m-4">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-700">Age: {age}</p>
      <p className="text-gray-700">Role: {role}</p>
    </div>
  );
}

// ============================================
// 3. COMPONENT WITH STATE
// ============================================
// useState hook lets you add state to functional components
// State is data that can change over time
function Counter() {
  // Syntax: const [value, setValue] = useState(initialValue)
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 border-2 border-green-400 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4">Counter Component</h2>
      
      {/* Display current count */}
      <p className="text-4xl font-bold text-green-600 mb-4">{count}</p>
      
      {/* Buttons to update state */}
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
      >
        Increment
      </button>
      
      <button
        onClick={() => setCount(count - 1)}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Decrement
      </button>
      
      <button
        onClick={() => setCount(0)}
        className="px-4 py-2 bg-gray-500 text-white rounded ml-2 hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  );
}

// ============================================
// 4. COMPONENT WITH MULTIPLE STATE VALUES
// ============================================
// You can use multiple useState hooks
interface FormData {
  name: string;
  email: string;
  message: string;
}

function SimpleForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  // When input changes, update the state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Spread operator (...) keeps existing data and updates only the changed field
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(`Name: ${formData.name}, Email: ${formData.email}`);
  };

  return (
    <div className="p-6 border-2 border-purple-400 rounded-lg m-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Simple Form</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Your email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Your message"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Submit
        </button>
      </form>

      {/* Show submitted data */}
      {formData.name && (
        <div className="mt-4 p-3 bg-purple-100 rounded">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// 5. CONDITIONAL RENDERING
// ============================================
// Show/hide content based on conditions
function ToggleContent() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="p-6 border-2 border-orange-400 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4">Toggle Content</h2>
      
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mb-4"
      >
        {isVisible ? 'Hide' : 'Show'} Content
      </button>

      {/* Conditional rendering */}
      {isVisible && (
        <div className="p-4 bg-orange-100 rounded">
          <p>🎉 Hidden content is now visible!</p>
          <p>This content shows/hides based on state</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. RENDERING LISTS
// ============================================
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, text: 'Learn React basics', completed: true },
    { id: 2, text: 'Understand Props', completed: true },
    { id: 3, text: 'Master useState hook', completed: false },
    { id: 4, text: 'Build real projects', completed: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="p-6 border-2 border-indigo-400 rounded-lg m-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      
      <ul className="space-y-2">
        {/* Use .map() to render lists */}
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex items-center p-2 bg-indigo-50 rounded cursor-pointer"
            onClick={() => toggleTodo(todo.id)}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {}}
              className="mr-3"
            />
            <span
              className={`flex-1 ${
                todo.completed
                  ? 'line-through text-gray-400'
                  : 'text-gray-800'
              }`}
            >
              {todo.text}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-600">
        Completed: {todos.filter(t => t.completed).length} / {todos.length}
      </p>
    </div>
  );
}

// ============================================
// 7. MAIN LEARNING COMPONENT
// ============================================
// This component puts it all together
export function LearningComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-center">🚀 React Learning Guide</h1>
        <p className="text-center text-gray-400 mb-8">
          Below are the fundamental React patterns you need to master
        </p>

        <div className="bg-slate-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📚 Key Concepts:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Components:</strong> Reusable pieces of UI</li>
            <li><strong>Props:</strong> Pass data to components</li>
            <li><strong>State:</strong> Data that changes over time</li>
            <li><strong>useState:</strong> Hook to manage state</li>
            <li><strong>JSX:</strong> JavaScript + XML (HTML in JS)</li>
            <li><strong>Events:</strong> onClick, onChange, onSubmit, etc.</li>
            <li><strong>Conditional Rendering:</strong> Show/hide based on conditions</li>
            <li><strong>Lists:</strong> Render arrays with .map()</li>
          </ul>
        </div>

        {/* Display all learning components */}
        <Welcome />
        
        <div className="grid md:grid-cols-2 gap-4">
          <UserCard name="Alice" age={28} role="React Developer" />
          <UserCard name="Bob" age={32} role="UI Designer" />
        </div>

        <Counter />
        
        <div className="grid md:grid-cols-2 gap-4">
          <SimpleForm />
          <ToggleContent />
        </div>

        <TodoList />

        <div className="mt-8 p-6 bg-blue-500/20 border border-blue-400 rounded-lg">
          <h3 className="text-xl font-bold mb-2">💡 Tips for Learning:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-100">
            <li>Play with the code - change values and see what happens</li>
            <li>Open browser DevTools (F12) and check the Console</li>
            <li>Try adding new features to these components</li>
            <li>Look at your existing components (Navbar, TiltCard, etc.) to see advanced patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
