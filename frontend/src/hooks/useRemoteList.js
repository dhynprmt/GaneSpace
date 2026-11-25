import { useEffect, useState } from "react";

export function useRemoteList(load) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let active = true;
    load().then((data) => {
      if (active) setResult({ data, load, revision });
    }).catch((err) => {
      if (active) setResult({ error: err.message, load, revision });
    });
    return () => { active = false; };
  }, [load, revision]);
  const current = result?.load === load && result.revision === revision ? result : null;
  return { data: current?.data, items: Array.isArray(current?.data) ? current.data : [], error: current?.error, loading: !current,
    refresh: () => setRevision((value) => value + 1) };
}
