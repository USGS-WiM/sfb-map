using System;
using System.Configuration;
using System.Collections;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using System.Data.SqlClient;

namespace getAI
{
    public partial class _Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            Response.ContentType = "text/xml";
            Response.ContentEncoding = System.Text.Encoding.UTF8;

            string table_cd = Request.QueryString["table_cd"];
            ArrayList speciesID = new ArrayList();
            ArrayList aiArray = new ArrayList();

            SqlConnection conn = new SqlConnection("Server=localhost\\SQLEXPRESS;Database=SFB;Integrated Security=True");

            SqlCommand comm = new SqlCommand("SELECT Species_ID FROM ComboSpecies WHERE Table_CD = '" + table_cd + "'", conn);

            conn.Open();
            SqlDataReader reader = comm.ExecuteReader();

            while (reader.Read())
            {
                speciesID.Add(reader["Species_ID"]);
            }

            reader.Close();

            int j;

            for (j = 0; j < speciesID.Count; j++)
            {
                SqlCommand comm3 = new SqlCommand("SELECT AI_ID FROM Species_AI WHERE Species_ID = '" + speciesID[j] + "'", conn);

                SqlDataReader reader3 = comm3.ExecuteReader();

                while (reader3.Read())
                {
                    //aiList.InnerText += reader3["AI_ID"] + "-";
                    if (!aiArray.Contains(reader3["AI_ID"]))
                    {
                        aiArray.Add(reader3["AI_ID"]);
                    }
                }
                reader3.Close();
            }

            aiArray.Sort();

            int i;

            Response.Write("<?xml version='1.0'?>");
            Response.Write("<aiList>");
            
            for (i = 0; i < aiArray.Count; i++)
            {
                SqlCommand comm4 = new SqlCommand("SELECT AI FROM AI WHERE ID = '" + aiArray[i] + "'", conn);

                SqlDataReader reader4 = comm4.ExecuteReader();

                while (reader4.Read())
                {
                    Response.Write("<AI>" + reader4["AI"] + "</AI>");
                }
                reader4.Close();
            }

            Response.Write("</aiList>");
            Response.End();
                    
            conn.Close();
        }
    }
}
