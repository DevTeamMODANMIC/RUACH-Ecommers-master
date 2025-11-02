/**
 * Script to test IndexedDB slider implementation
 */

// Mock browser APIs for Node.js environment
import fakeIndexedDB from 'fake-indexeddb';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

global.indexedDB = fakeIndexedDB;
global.IDBKeyRange = FDBKeyRange;

// Import IndexedDB slider utilities
import { 
  getAllSliderItems,
  createSliderItem,
  updateSliderItem,
  deleteSliderItem,
  initializeDefaultSliderItems
} from '../lib/indexeddb-slider.js';

async function testIndexedDB() {
  console.log('Testing IndexedDB slider implementation...');
  
  try {
    // Test initialization
    console.log('1. Testing initialization...');
    const initResult = await initializeDefaultSliderItems();
    console.log(`   Initialization result: ${initResult}`);
    
    // Test getting all items
    console.log('2. Testing get all items...');
    const items = await getAllSliderItems();
    console.log(`   Retrieved ${items.length} items`);
    
    // Test creating an item
    console.log('3. Testing create item...');
    const newItem = await createSliderItem({
      title: "Test Slide",
      subtitle: "This is a test slide",
      description: "Test description",
      image: "https://example.com/test.jpg",
      cta: "Click Me",
      ctaLink: "/test"
    });
    console.log(`   Created item with ID: ${newItem.id}`);
    
    // Test updating an item
    console.log('4. Testing update item...');
    const updatedItem = await updateSliderItem(newItem.id, {
      title: "Updated Test Slide",
      cta: "Click Here"
    });
    console.log(`   Updated item: ${updatedItem.title}, ${updatedItem.cta}`);
    
    // Test getting all items again
    console.log('5. Testing get all items after modifications...');
    const updatedItems = await getAllSliderItems();
    console.log(`   Retrieved ${updatedItems.length} items after modifications`);
    
    // Test deleting an item
    console.log('6. Testing delete item...');
    const deleteResult = await deleteSliderItem(newItem.id);
    console.log(`   Delete result: ${deleteResult}`);
    
    // Final test
    console.log('7. Testing final state...');
    const finalItems = await getAllSliderItems();
    console.log(`   Final item count: ${finalItems.length}`);
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testIndexedDB();