// Mock @testing-library/react-native with proper event handling
const React = require('react');
const TestRenderer = require('react-test-renderer');

// Store the test renderer instance for event handling
let currentInstance = null;

const findByText = (root, text, options = {}) => {
  const findTextInNode = (node) => {
    if (!node) return null;
    
    // Check if this node's children contain the text
    if (node.children) {
      for (const child of node.children) {
        if (typeof child === 'string') {
          const matches = options.exact !== false 
            ? child === text 
            : child.includes(text);
          if (matches) return node;
        }
        if (typeof child === 'object') {
          const found = findTextInNode(child);
          if (found) return found;
        }
      }
    }
    
    // Check props.children
    if (node.props && node.props.children) {
      if (typeof node.props.children === 'string') {
        const matches = options.exact !== false 
          ? node.props.children === text 
          : node.props.children.includes(text);
        if (matches) return node;
      }
      if (Array.isArray(node.props.children)) {
        for (const child of node.props.children) {
          if (typeof child === 'string') {
            const matches = options.exact !== false 
              ? child === text 
              : child.includes(text);
            if (matches) return node;
          }
        }
      }
    }
    
    return null;
  };
  
  const result = findTextInNode(root);
  if (result) return result;
  
  throw new Error(`Unable to find element with text: ${text}`);
};

const findByTestId = (root, testId) => {
  const findNode = (node) => {
    if (!node) return null;
    if (node.props && node.props.testID === testId) return node;
    if (node.children) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          const found = findNode(child);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  const result = findNode(root);
  if (result) return result;
  
  throw new Error(`Unable to find element with testID: ${testId}`);
};

const findClickableParent = (tree, node) => {
  // Look for the actual touchable component that has onPress
  const findParentWithOnPress = (searchNode, targetNode, parent = null) => {
    if (!searchNode) return null;
    
    // If this node has onPress and contains our target, return it
    if (searchNode.props && searchNode.props.onPress) {
      // Check if target is in subtree
      const containsTarget = JSON.stringify(searchNode).includes(JSON.stringify(targetNode).slice(0, 50));
      if (containsTarget) return searchNode;
    }
    
    if (searchNode.children) {
      for (const child of searchNode.children) {
        if (typeof child === 'object') {
          const found = findParentWithOnPress(child, targetNode, searchNode);
          if (found) return found;
        }
      }
    }
    
    return null;
  };
  
  return findParentWithOnPress(tree, node);
};

const render = (component) => {
  const rendered = TestRenderer.create(component);
  currentInstance = rendered;
  
  const getTree = () => rendered.toJSON();
  const getRoot = () => rendered.root;
  
  return {
    getByText: (text, options) => {
      const tree = getTree();
      return findByText(tree, text, options);
    },
    getByTestId: (testId) => {
      const tree = getTree();
      return findByTestId(tree, testId);
    },
    queryByText: (text, options) => {
      try {
        const tree = getTree();
        return findByText(tree, text, options);
      } catch {
        return null;
      }
    },
    queryByTestId: (testId) => {
      try {
        const tree = getTree();
        return findByTestId(tree, testId);
      } catch {
        return null;
      }
    },
    getAllByText: (text, options) => {
      const results = [];
      const tree = getTree();
      const search = (node) => {
        if (!node) return;
        if (node.children) {
          for (const child of node.children) {
            if (typeof child === 'string') {
              const matches = options?.exact !== false 
                ? child === text 
                : child.includes(text);
              if (matches) {
                results.push(node);
                break;
              }
            }
            if (typeof child === 'object') {
              search(child);
            }
          }
        }
      };
      search(tree);
      return results;
    },
    getByRole: (role, options) => {
      const tree = getTree();
      const findByRole = (node) => {
        if (!node) return null;
        if (node.props && node.props.accessibilityRole === role) {
          if (options?.name) {
            const hasName = node.children?.some(c => 
              typeof c === 'string' && c.includes(options.name)
            );
            if (!hasName) return null;
          }
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            if (typeof child === 'object') {
              const found = findByRole(child);
              if (found) return found;
            }
          }
        }
        return null;
      };
      const result = findByRole(tree);
      if (!result) throw new Error(`Unable to find element with role: ${role}`);
      return result;
    },
    debug: (node) => {
      const target = node || getTree();
      console.log(JSON.stringify(target, null, 2));
    },
    toJSON: () => getTree(),
    unmount: () => rendered.unmount(),
    rerender: (newComponent) => rendered.update(newComponent),
    container: rendered,
    root: getRoot,
    UNSAFE_root: getRoot(),
  };
};

const fireEvent = {
  press: (element) => {
    // First try direct onPress
    if (element && element.props && typeof element.props.onPress === 'function') {
      element.props.onPress();
      return;
    }
    
    // Look for parent with onPress in current tree
    if (currentInstance) {
      const tree = currentInstance.toJSON();
      const clickable = findClickableParent(tree, element);
      if (clickable && clickable.props && typeof clickable.props.onPress === 'function') {
        clickable.props.onPress();
        return;
      }
    }
    
    // Try to find by traversing the component instance
    if (currentInstance) {
      try {
        const root = currentInstance.root;
        const allTouchables = root.findAll(node => 
          node.props && typeof node.props.onPress === 'function'
        );
        
        // Find the touchable that contains text matching our element
        if (element.children) {
          const elementText = element.children.find(c => typeof c === 'string');
          if (elementText) {
            for (const touchable of allTouchables) {
              const json = JSON.stringify(touchable.props);
              if (json.includes(elementText)) {
                touchable.props.onPress();
                return;
              }
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    }
  },
  changeText: (element, text) => {
    if (element && element.props && typeof element.props.onChangeText === 'function') {
      element.props.onChangeText(text);
    }
  },
  scroll: (element, event) => {
    if (element && element.props && typeof element.props.onScroll === 'function') {
      element.props.onScroll(event);
    }
  },
  focus: (element) => {
    if (element && element.props && typeof element.props.onFocus === 'function') {
      element.props.onFocus();
    }
  },
  blur: (element) => {
    if (element && element.props && typeof element.props.onBlur === 'function') {
      element.props.onBlur();
    }
  },
};

const waitFor = async (callback, options = {}) => {
  const timeout = options.timeout || 4500;
  const interval = options.interval || 50;
  const startTime = Date.now();
  let lastError;
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      return result;
    } catch (e) {
      lastError = e;
    }
    await new Promise(r => setTimeout(r, interval));
  }
  
  throw lastError || new Error('waitFor timed out');
};

const act = (callback) => {
  const testRenderer = require('react-test-renderer');
  if (testRenderer.act) {
    return testRenderer.act(callback);
  }
  return callback();
};

const within = (element) => {
  return {
    getByText: (text, options) => findByText(element, text, options),
    getByTestId: (testId) => findByTestId(element, testId),
    queryByText: (text, options) => {
      try { return findByText(element, text, options); } catch { return null; }
    },
    queryByTestId: (testId) => {
      try { return findByTestId(element, testId); } catch { return null; }
    },
  };
};

const screen = {
  getByText: () => { throw new Error('Use render() return value'); },
  getByTestId: () => { throw new Error('Use render() return value'); },
};

const cleanup = () => {
  currentInstance = null;
};

module.exports = {
  render,
  fireEvent,
  waitFor,
  act,
  within,
  screen,
  cleanup,
};
