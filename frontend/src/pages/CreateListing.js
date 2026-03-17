function CreateListing() {
  return (
    <div>
      <h2>Create Listing</h2>

      <input placeholder="Title" />
      <br />
      <input placeholder="Price" />
      <br />
      <textarea placeholder="Description" />
      <br />
      <button>Create</button>
    </div>
  );
}

export default CreateListing;