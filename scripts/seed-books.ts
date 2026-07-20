import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  books,
  authors,
  publishers,
  categories,
  bookAuthors,
  bookCategories,
  bookCopies,
} from "../src/db/schema";
import { sql } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Fiction", description: "Novels, short stories, and imaginative narratives" },
  { name: "Science", description: "Scientific discoveries, research, and natural phenomena" },
  { name: "Technology", description: "Computing, engineering, and modern tech" },
  { name: "History", description: "Historical events, civilizations, and biographies" },
  { name: "Mathematics", description: "Pure and applied mathematics" },
  { name: "Philosophy", description: "Ethics, logic, metaphysics, and epistemology" },
  { name: "Psychology", description: "Human behavior, cognition, and mental health" },
  { name: "Literature", description: "Classic and modern literary works and criticism" },
  { name: "Computer Science", description: "Algorithms, data structures, and programming" },
  { name: "Business", description: "Management, economics, entrepreneurship, and finance" },
];

const AUTHORS = [
  { name: "George Orwell", bio: "English novelist and essayist known for dystopian fiction" },
  { name: "Harper Lee", bio: "American novelist widely known for To Kill a Mockingbird" },
  { name: "F. Scott Fitzgerald", bio: "American novelist of the Jazz Age" },
  { name: "Jane Austen", bio: "English novelist known for romantic fiction" },
  { name: "Mark Twain", bio: "American author and humorist" },
  { name: "Ernest Hemingway", bio: "American novelist and Nobel Prize laureate" },
  { name: "J.D. Salinger", bio: "American writer known for The Catcher in the Rye" },
  { name: "Gabriel García Márquez", bio: "Colombian novelist and Nobel Prize laureate" },
  { name: "Toni Morrison", bio: "American novelist and Nobel Prize laureate" },
  { name: "Kurt Vonnegut", bio: "American writer of satirical and darkly humorous novels" },
  { name: "Stephen Hawking", bio: "Theoretical physicist and cosmologist" },
  { name: "Carl Sagan", bio: "American astronomer and science communicator" },
  { name: "Richard Feynman", bio: "American theoretical physicist and Nobel laureate" },
  { name: "Yuval Noah Harari", bio: "Israeli historian and author of Sapiens" },
  { name: "Robert C. Martin", bio: "American software engineer and author of Clean Code" },
  { name: "Martin Fowler", bio: "British software developer and author" },
  { name: "Donald Knuth", bio: "American computer scientist, father of algorithm analysis" },
  { name: "Thomas H. Cormen", bio: "American computer scientist and textbook author" },
  { name: "Daniel Kahneman", bio: "Israeli-American psychologist and Nobel laureate" },
  { name: "Malcolm Gladwell", bio: "Canadian journalist and author" },
  { name: "Peter Thiel", bio: "American entrepreneur and venture capitalist" },
  { name: "Eric Ries", bio: "American entrepreneur and author of The Lean Startup" },
  { name: "Dale Carnegie", bio: "American writer and lecturer on self-improvement" },
  { name: "Viktor Frankl", bio: "Austrian neurologist and Holocaust survivor" },
  { name: "Marcus Aurelius", bio: "Roman Emperor and Stoic philosopher" },
  { name: "Sun Tzu", bio: "Ancient Chinese military strategist" },
  { name: "Aldous Huxley", bio: "English writer known for Brave New World" },
  { name: "Ray Bradbury", bio: "American author known for Fahrenheit 451" },
  { name: "Isaac Asimov", bio: "American writer and professor of biochemistry" },
  { name: "Paulo Coelho", bio: "Brazilian lyricist and novelist" },
];

const PUBLISHERS = [
  { name: "Penguin Random House", contact: "info@penguinrandomhouse.com" },
  { name: "HarperCollins", contact: "info@harpercollins.com" },
  { name: "Simon & Schuster", contact: "info@simonandschuster.com" },
  { name: "Hachette Book Group", contact: "info@hachettebookgroup.com" },
  { name: "Macmillan Publishers", contact: "info@macmillan.com" },
  { name: "Oxford University Press", contact: "info@oup.com" },
  { name: "Cambridge University Press", contact: "info@cambridge.org" },
  { name: "O'Reilly Media", contact: "info@oreilly.com" },
  { name: "MIT Press", contact: "info@mitpress.mit.edu" },
  { name: "Pearson Education", contact: "info@pearson.com" },
];

// Each book: [title, isbn, callNumber, publisherIndex, year, totalCopies, description, authorIndices[], categoryIndices[]]
const BOOKS: [string, string, string, number, number, number, string, number[], number[]][] = [
  ["1984", "9780451524935", "FIC-001", 0, 1949, 3, "A dystopian novel set in a totalitarian society ruled by Big Brother.", [0], [0, 7]],
  ["To Kill a Mockingbird", "9780061120084", "FIC-002", 1, 1960, 2, "A novel about racial injustice in the American South through the eyes of a young girl.", [1], [0, 7]],
  ["The Great Gatsby", "9780743273565", "FIC-003", 2, 1925, 2, "A portrait of the Jazz Age and the American Dream's corruption.", [2], [0, 7]],
  ["Pride and Prejudice", "9780141439518", "FIC-004", 0, 1813, 3, "A romantic novel that critiques the British landed gentry at the turn of the 19th century.", [3], [0, 7]],
  ["Adventures of Huckleberry Finn", "9780486280615", "FIC-005", 0, 1884, 2, "A novel about a boy's journey down the Mississippi River with an escaped slave.", [4], [0, 7]],
  ["The Old Man and the Sea", "9780684801223", "FIC-006", 2, 1952, 2, "An aging Cuban fisherman's struggle with a giant marlin far out in the Gulf Stream.", [5], [0, 7]],
  ["The Catcher in the Rye", "9780316769488", "FIC-007", 3, 1951, 3, "A story of teenage angst and alienation narrated by Holden Caulfield.", [6], [0, 7]],
  ["One Hundred Years of Solitude", "9780060883287", "FIC-008", 1, 1967, 2, "A multi-generational story of the Buendía family in the fictional town of Macondo.", [7], [0, 7]],
  ["Beloved", "9781400033416", "FIC-009", 0, 1987, 2, "A powerful story about a formerly enslaved woman haunted by her past.", [8], [0, 7]],
  ["Slaughterhouse-Five", "9780440180296", "FIC-010", 3, 1969, 2, "An anti-war novel blending science fiction and satire about the bombing of Dresden.", [9], [0]],
  ["A Brief History of Time", "9780553380163", "SCI-001", 4, 1988, 3, "An exploration of cosmology from the Big Bang to black holes for general readers.", [10], [1]],
  ["Cosmos", "9780345539434", "SCI-002", 0, 1980, 2, "A sweeping journey through the universe exploring stars, galaxies, and the origin of life.", [11], [1]],
  ["Surely You're Joking, Mr. Feynman!", "9780393355628", "SCI-003", 4, 1985, 2, "Autobiographical adventures of the Nobel Prize-winning physicist.", [12], [1]],
  ["Sapiens: A Brief History of Humankind", "9780062316097", "HIS-001", 1, 2011, 3, "An exploration of how Homo sapiens came to dominate the world.", [13], [3, 1]],
  ["Homo Deus: A Brief History of Tomorrow", "9780062464316", "HIS-002", 1, 2015, 2, "A look at humanity's future with technology, AI, and bioengineering.", [13], [3, 1]],
  ["Clean Code", "9780132350884", "CS-001", 9, 2008, 3, "A handbook of agile software craftsmanship for writing readable, maintainable code.", [14], [8, 2]],
  ["The Clean Coder", "9780137081073", "CS-002", 9, 2011, 2, "A code of conduct for professional programmers.", [14], [8, 2]],
  ["Refactoring", "9780134757599", "CS-003", 9, 2018, 2, "Improving the design of existing code through systematic refactoring techniques.", [15], [8, 2]],
  ["The Art of Computer Programming Vol.1", "9780201896831", "CS-004", 9, 1968, 1, "Fundamental algorithms — the definitive reference for computer science.", [16], [8, 4]],
  ["Introduction to Algorithms", "9780262033848", "CS-005", 8, 2009, 3, "The comprehensive textbook on algorithms, widely known as CLRS.", [17], [8, 4]],
  ["Thinking, Fast and Slow", "9780374533557", "PSY-001", 5, 2011, 3, "An exploration of the two systems that drive the way we think.", [18], [6]],
  ["Outliers", "9780316017930", "PSY-002", 3, 2008, 2, "The story of success — why some people achieve so much more than others.", [19], [6, 9]],
  ["The Tipping Point", "9780316346627", "PSY-003", 3, 2000, 2, "How little things can make a big difference in social epidemics.", [19], [6, 9]],
  ["Blink", "9780316010665", "PSY-004", 3, 2005, 2, "The power of thinking without thinking — snap judgments and rapid cognition.", [19], [6]],
  ["Zero to One", "9780804139298", "BUS-001", 2, 2014, 3, "Notes on startups, or how to build the future.", [20], [9, 2]],
  ["The Lean Startup", "9780307887894", "BUS-002", 0, 2011, 2, "How today's entrepreneurs use continuous innovation to create successful businesses.", [21], [9]],
  ["How to Win Friends and Influence People", "9780671027032", "BUS-003", 2, 1936, 3, "A timeless guide to interpersonal skills and communication.", [22], [9, 6]],
  ["Man's Search for Meaning", "9780807014295", "PHI-001", 4, 1946, 3, "A memoir and introduction to logotherapy from the Nazi death camps.", [23], [5, 6]],
  ["Meditations", "9780140449334", "PHI-002", 0, 180, 2, "Personal writings by the Roman Emperor on Stoic philosophy.", [24], [5]],
  ["The Art of War", "9781590302255", "PHI-003", 3, -500, 2, "The ancient Chinese military treatise on strategy and tactics.", [25], [5, 3]],
  ["Brave New World", "9780060850524", "FIC-011", 1, 1932, 2, "A dystopian novel set in a futuristic World State of genetically modified citizens.", [26], [0, 7]],
  ["Fahrenheit 451", "9781451673319", "FIC-012", 2, 1953, 2, "A dystopian novel about a future where books are banned and firemen burn them.", [27], [0, 7]],
  ["Animal Farm", "9780451526342", "FIC-013", 0, 1945, 3, "An allegorical novella reflecting events leading up to the Russian Revolution.", [0], [0, 7]],
  ["Foundation", "9780553293357", "FIC-014", 4, 1951, 2, "A science fiction novel about psychohistory and the fall of a galactic empire.", [28], [0, 1]],
  ["I, Robot", "9780553294385", "FIC-015", 4, 1950, 2, "A collection of science fiction short stories exploring the Three Laws of Robotics.", [28], [0, 1]],
  ["The Alchemist", "9780062315007", "FIC-016", 1, 1988, 3, "A philosophical novel about a shepherd boy's journey to find treasure in Egypt.", [29], [0, 5]],
  ["A Farewell to Arms", "9780684801469", "FIC-017", 2, 1929, 2, "A semi-autobiographical novel about an American ambulance driver in World War I Italy.", [5], [0, 7]],
  ["The Sun Also Rises", "9780743297332", "FIC-018", 2, 1926, 2, "A novel about a group of American and British expatriates traveling from Paris to Pamplona.", [5], [0, 7]],
  ["Sense and Sensibility", "9780141439662", "FIC-019", 0, 1811, 2, "A novel about the Dashwood sisters navigating love and heartbreak.", [3], [0, 7]],
  ["Emma", "9780141439587", "FIC-020", 0, 1815, 2, "A novel about youthful hubris and romantic misunderstandings.", [3], [0, 7]],
  ["Song of Solomon", "9781400033423", "FIC-021", 0, 1977, 2, "A novel about an African-American man's journey of self-discovery.", [8], [0, 7]],
  ["The Pale King", "9780316074230", "LIT-001", 3, 2011, 1, "An unfinished novel about IRS workers and the nature of boredom.", [9], [7]],
  ["21 Lessons for the 21st Century", "9780525512172", "HIS-003", 0, 2018, 2, "Addresses the most urgent questions facing humanity today.", [13], [3, 5]],
  ["The Black Hole War", "9780316016414", "SCI-004", 3, 2008, 2, "The battle over the fate of quantum information inside black holes.", [10], [1]],
  ["The Grand Design", "9780553384666", "SCI-005", 4, 2010, 2, "Explores the nature of the universe and the theory of everything.", [10], [1]],
  ["Design Patterns", "9780201633610", "CS-006", 9, 1994, 2, "Elements of reusable object-oriented software — the Gang of Four classic.", [15], [8, 2]],
  ["The Pragmatic Programmer", "9780135957059", "CS-007", 9, 2019, 3, "Your journey to mastery — timeless advice for modern software developers.", [14], [8, 2]],
  ["Patterns of Enterprise Application Architecture", "9780321127426", "CS-008", 9, 2002, 1, "A catalog of architectural patterns for enterprise application development.", [15], [8, 2]],
  ["David and Goliath", "9780316204361", "PSY-005", 3, 2013, 2, "Underdogs, misfits, and the art of battling giants.", [19], [6, 9]],
  ["The Contact Paradox", "9781472960429", "SCI-006", 4, 2019, 1, "Challenging assumptions about the search for extraterrestrial intelligence.", [11], [1]],
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seedBooks() {
  console.log("📚 Seeding 50 books into the database...\n");

  // Step 1: Clear existing data (order matters for foreign keys)
  console.log("🗑️  Clearing existing book data...");
  await db.delete(bookCopies);
  await db.delete(bookCategories);
  await db.delete(bookAuthors);
  await db.delete(books);
  await db.delete(authors);
  await db.delete(publishers);
  await db.delete(categories);
  console.log("   Done.\n");

  // Step 2: Insert categories
  console.log("📂 Inserting 10 categories...");
  const insertedCategories = await db
    .insert(categories)
    .values(CATEGORIES)
    .returning({ id: categories.id, name: categories.name });
  console.log(`   Inserted ${insertedCategories.length} categories.`);

  // Step 3: Insert authors
  console.log("✍️  Inserting 30 authors...");
  const insertedAuthors = await db
    .insert(authors)
    .values(AUTHORS)
    .returning({ id: authors.id, name: authors.name });
  console.log(`   Inserted ${insertedAuthors.length} authors.`);

  // Step 4: Insert publishers
  console.log("🏢 Inserting 10 publishers...");
  const insertedPublishers = await db
    .insert(publishers)
    .values(PUBLISHERS)
    .returning({ id: publishers.id, name: publishers.name });
  console.log(`   Inserted ${insertedPublishers.length} publishers.`);

  // Step 5: Insert books
  console.log("📖 Inserting 50 books...");
  let bookCount = 0;

  for (const [title, isbn, callNumber, pubIdx, year, totalCopies, description, authorIdxs, catIdxs] of BOOKS) {
    const [insertedBook] = await db
      .insert(books)
      .values({
        title,
        isbn,
        callNumber,
        publisherId: insertedPublishers[pubIdx].id,
        year,
        totalCopies,
        availableCopies: totalCopies,
        description,
      })
      .returning({ id: books.id });

    // Link authors
    for (const aIdx of authorIdxs) {
      await db.insert(bookAuthors).values({
        bookId: insertedBook.id,
        authorId: insertedAuthors[aIdx].id,
      });
    }

    // Link categories
    for (const cIdx of catIdxs) {
      await db.insert(bookCategories).values({
        bookId: insertedBook.id,
        categoryId: insertedCategories[cIdx].id,
      });
    }

    // Create copies
    for (let i = 1; i <= totalCopies; i++) {
      const barcode = `${callNumber}-C${String(i).padStart(2, "0")}`;
      const conditions = ["New", "Good", "Fair"];
      await db.insert(bookCopies).values({
        bookId: insertedBook.id,
        barcode,
        status: "AVAILABLE",
        condition: conditions[i % conditions.length],
      });
    }

    bookCount++;
  }

  console.log(`   Inserted ${bookCount} books with copies.\n`);

  // Step 6: Print summary
  const [{ bookTotal }] = await db.select({ bookTotal: sql<number>`count(*)` }).from(books);
  const [{ copyTotal }] = await db.select({ copyTotal: sql<number>`count(*)` }).from(bookCopies);
  const [{ authorTotal }] = await db.select({ authorTotal: sql<number>`count(*)` }).from(authors);
  const [{ categoryTotal }] = await db.select({ categoryTotal: sql<number>`count(*)` }).from(categories);
  const [{ publisherTotal }] = await db.select({ publisherTotal: sql<number>`count(*)` }).from(publishers);

  console.log("   ┌──────────────────────────────────────┐");
  console.log("   │  📚  Book Seed Summary                │");
  console.log("   ├──────────────────────────────────────┤");
  console.log(`   │  Books:       ${String(bookTotal).padEnd(22)} │`);
  console.log(`   │  Copies:      ${String(copyTotal).padEnd(22)} │`);
  console.log(`   │  Authors:     ${String(authorTotal).padEnd(22)} │`);
  console.log(`   │  Categories:  ${String(categoryTotal).padEnd(22)} │`);
  console.log(`   │  Publishers:  ${String(publisherTotal).padEnd(22)} │`);
  console.log("   └──────────────────────────────────────┘");
  console.log("\n✅ Book seeding complete!\n");
}

seedBooks()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
