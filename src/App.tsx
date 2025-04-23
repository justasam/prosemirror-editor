import './App.css'
import ProseMirrorEditor from './components/ProseMirrorEditor'
import ProseMirrorEditorMenu from './components/ProseMirrorEditorMenu'
import { EditorProvider } from './context/EditorContext'

function App() {
  return (
    <div>
      <EditorProvider>
        <ProseMirrorEditorMenu />
        <ProseMirrorEditor />
      </EditorProvider>
    </div>
  )
}

export default App
