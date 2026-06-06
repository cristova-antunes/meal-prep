import "ckeditor5/ckeditor5.css";
import CreateNoteForm from "./CreateNoteForm";

export default async function NotesPage() {
  const CK_KEY = process.env.CK_EDITOR_KEY;

  if (!CK_KEY || CK_KEY === "") {
    return null;
  }

  return <CreateNoteForm ckEditorKey={CK_KEY} />;
}
