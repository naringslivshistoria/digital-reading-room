import { Document } from '../../../common/types'

interface Props {
  documents: Document[] | undefined
  isLoading: boolean
}

const comprimaAdapterUrl = import.meta.env.VITE_COMPRIMA_ADAPTER_URL || 'http://localhost:4000'
const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export function SearchResult({
  documents,
}: Props) {
  return (
    <table className="border-separate border-spacing-4 border">
      <thead>
        <tr>
          <th className="border border-slate-300">Titel</th>
          <th className="border border-slate-300">Arkiv</th>
          <th className="border border-slate-300">Serie</th>
          <th className="border border-slate-300">Beskrivning</th>
          <th className="border border-slate-300">Tidsperiod</th>
          <th className="border border-slate-300">Bilaga</th>
        </tr>
      </thead>
      <tbody>
        {documents && documents.map((document) => { 
          return (
          <tr key={document.id} style={{ height: "40px" }}>
            <td className="border border-slate-300">
              {document.fields.title?.value}
            </td>
            <td className="border border-slate-300">
              {document.fields.archiveInitiator?.value}
            </td>
            <td className="border border-slate-300">
              {document.fields.seriesName?.value}
            </td>
            <td className="border border-slate-300">
              {document.fields.description?.value}
            </td>
            <td className="border border-slate-300">
              {document.fields.time?.value}
            </td>
            <td className="border border-slate-300">
              <a href={comprimaAdapterUrl + "/document/" + document.id + "/attachment"} target="_blank" rel="noreferrer">
                <img src={searchUrl + "/thumbnail/" + document.id} style={{maxHeight: "40px"}} alt=""></img>
              </a>
            </td>
          </tr>
      )})}
      </tbody>
    </table>
  )
}