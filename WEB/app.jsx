/* Terracota Studio — app root */
const { useState, useEffect } = React;

function useHashProjectSync(openProject, setOpenProject) {
  // Sync the current project overlay with the URL hash so each project has a
  // shareable deep-link (#proyecto/<slug>). Reacts to back/forward navigation too.
  useEffect(() => {
    const readFromHash = () => {
      const m = window.location.hash.match(/^#proyecto\/([a-z0-9-]+)$/i);
      if (!m) return null;
      return PROJECTS.find(p => p.id === m[1]) || null;
    };

    const fromHash = readFromHash();
    if (fromHash && (!openProject || openProject.id !== fromHash.id)) {
      setOpenProject(fromHash);
    }

    const onHashChange = () => {
      const next = readFromHash();
      setOpenProject(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openProject) {
      if (window.location.hash.startsWith('#proyecto/')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return;
    }
    const wanted = '#proyecto/' + openProject.id;
    if (window.location.hash !== wanted) {
      history.replaceState(null, '', wanted);
    }
  }, [openProject]);
}

function App() {
  const [openProject, setOpenProject] = useState(null);
  useHashProjectSync(openProject, setOpenProject);

  // Toggle the overlay container's .open class from the parent so it also
  // unmounts cleanly (ProjectDetail's own effect can't run on unmount).
  useEffect(() => {
    const overlay = document.getElementById('project-overlay');
    if (!overlay) return;
    if (openProject) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }, [openProject]);

  return (
    <>
      <About />
      <Services />
      <Philosophy />
      <Team />
      <Portfolio onOpen={setOpenProject} />
      <Contact />
      <Footer />
      <ProjectOverlayMount project={openProject} onClose={()=>setOpenProject(null)} onNav={setOpenProject} />
    </>
  );
}

function ProjectOverlayMount({project, onClose, onNav}) {
  const target = document.getElementById('project-overlay');
  if (!target) return null;
  return ReactDOM.createPortal(
    project ? <ProjectDetail project={project} onClose={onClose} onNav={onNav} /> : null,
    target
  );
}

ReactDOM.createRoot(document.getElementById('react-root')).render(<App />);
